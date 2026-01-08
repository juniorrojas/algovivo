import subprocess
import ctypes
import tempfile
from pathlib import Path
import algovivo_codegen

this_dirpath = Path(__file__).parent
codegen_dirpath = this_dirpath.parent
csrc_dirpath = codegen_dirpath / "algovivo_codegen" / "csrc"


def test_collision_energy_codegen():
    collision = algovivo_codegen.potentials.Collision()
    fn = collision.make_energy_fn("collision_energy")

    assert len(fn.args) == 4
    arg_names = [arg.name for arg in fn.args]
    assert "space_dim" in arg_names
    assert "k_collision" in arg_names
    assert "num_vertices" in arg_names
    assert "pos" in arg_names

    src = fn.codegen()

    assert "extern \"C\"" in src
    assert "float collision_energy(" in src

    assert "float potential_energy = 0.0;" in src
    assert "accumulate_collision_energy(" in src
    assert "return potential_energy;" in src


def compile_collision_energy() -> ctypes.CDLL:
    collision = algovivo_codegen.potentials.Collision()
    fn = collision.make_energy_fn("collision_energy")
    generated_fn = fn.codegen()

    with open(csrc_dirpath / "potentials" / "collision.h") as f:
        collision_h = f.read()

    cpp_src = collision_h + "\nnamespace algovivo {\n" + generated_fn + "\n}"

    with tempfile.TemporaryDirectory() as tmp_dirname:
        cpp_path = Path(tmp_dirname) / "collision_energy.cpp"
        so_path = Path(tmp_dirname) / "collision_energy.so"

        with open(cpp_path, "w") as f:
            f.write(cpp_src)

        result = subprocess.run(
            [
                "clang++",
                "-shared", "-fPIC", "-nostdlib",
                "-o", str(so_path),
                str(cpp_path)
            ],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            print("compilation failed:")
            print(result.stderr)
            return None

        lib = ctypes.CDLL(str(so_path))
        lib.collision_energy.argtypes = [
            ctypes.c_int,      # space_dim
            ctypes.c_float,    # k_collision
            ctypes.c_int,      # num_vertices
            ctypes.POINTER(ctypes.c_float),  # pos
        ]
        lib.collision_energy.restype = ctypes.c_float

        return lib


def test_collision_energy_forward():
    lib = compile_collision_energy()
    if lib is None:
        raise RuntimeError("compilation failed")

    space_dim = 2
    k_collision = 100.0
    num_vertices = 3

    # vertex 0: y = 0.5 (above ground, no collision)
    # vertex 1: y = -0.1 (below ground, collision)
    # vertex 2: y = -0.2 (below ground, collision)
    pos = (ctypes.c_float * 6)(
        0.0, 0.5,
        0.0, -0.1,
        0.0, -0.2
    )

    energy = lib.collision_energy(space_dim, k_collision, num_vertices, pos)

    # expected: k * py^2 for vertices below ground (py < 0)
    # vertex 0: y = 0.5 >= 0, no contribution
    # vertex 1: 100.0 * (-0.1)^2 = 100.0 * 0.01 = 1.0
    # vertex 2: 100.0 * (-0.2)^2 = 100.0 * 0.04 = 4.0
    # total: 5.0
    expected = 5.0

    assert abs(energy - expected) < 1e-5, f"energy mismatch: {energy} != {expected}"
