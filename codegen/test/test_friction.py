import subprocess
import ctypes
import tempfile
from pathlib import Path
import algovivo_codegen

this_dirpath = Path(__file__).parent
codegen_dirpath = this_dirpath.parent
csrc_dirpath = codegen_dirpath / "algovivo_codegen" / "csrc"


def test_friction_energy_codegen():
    friction = algovivo_codegen.potentials.Friction()
    fn = friction.make_energy_fn("friction_energy")

    assert len(fn.args) == 6
    arg_names = [arg.name for arg in fn.args]
    assert "space_dim" in arg_names
    assert "h" in arg_names
    assert "k_friction" in arg_names
    assert "num_vertices" in arg_names
    assert "pos0" in arg_names
    assert "pos" in arg_names

    src = fn.codegen()

    assert "extern \"C\"" in src
    assert "float friction_energy(" in src

    assert "float potential_energy = 0.0;" in src
    assert "accumulate_friction_energy(" in src
    assert "return potential_energy;" in src


def compile_friction_energy() -> ctypes.CDLL:
    friction = algovivo_codegen.potentials.Friction()
    fn = friction.make_energy_fn("friction_energy")
    generated_fn = fn.codegen()

    with open(csrc_dirpath / "potentials" / "friction.h") as f:
        friction_h = f.read()

    cpp_src = friction_h + "\nnamespace algovivo {\n" + generated_fn + "\n}"

    with tempfile.TemporaryDirectory() as tmp_dirname:
        cpp_path = Path(tmp_dirname) / "friction_energy.cpp"
        so_path = Path(tmp_dirname) / "friction_energy.so"

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
        lib.friction_energy.argtypes = [
            ctypes.c_int,      # space_dim
            ctypes.c_float,    # h
            ctypes.c_float,    # k_friction
            ctypes.c_int,      # num_vertices
            ctypes.POINTER(ctypes.c_float),  # pos0
            ctypes.POINTER(ctypes.c_float),  # pos
        ]
        lib.friction_energy.restype = ctypes.c_float

        return lib


def test_friction_energy_forward():
    lib = compile_friction_energy()
    if lib is None:
        raise RuntimeError("compilation failed")

    # test case: 3 vertices in 2D
    space_dim = 2
    h = 0.1
    k_friction = 100.0
    num_vertices = 3

    # vertex 0: p0y = 0.5 (above eps=0.01, no friction)
    # vertex 1: p0y = -0.1 (below ground, has friction)
    # vertex 2: p0y = 0.005 (below eps, has friction)
    pos0 = (ctypes.c_float * 6)(
        0.0, 0.5,
        0.0, -0.1,
        0.0, 0.005
    )

    # vertex 0: px = 0.0 (no movement, but above ground anyway)
    # vertex 1: px = 0.1 (moved in x)
    # vertex 2: px = 0.2 (moved in x)
    pos = (ctypes.c_float * 6)(
        0.0, 0.5,
        0.1, -0.1,
        0.2, 0.005
    )

    energy = lib.friction_energy(space_dim, h, k_friction, num_vertices, pos0, pos)

    # expected: k_friction * vx^2 * (-height) for vertices below eps
    # eps = 0.01
    # vertex 0: p0y = 0.5, height = 0.5 - 0.01 = 0.49 >= 0, no friction
    # vertex 1: p0y = -0.1, height = -0.1 - 0.01 = -0.11 < 0
    #           vx = (0.1 - 0.0) / 0.1 = 1.0
    #           energy = 100 * 1.0^2 * 0.11 = 11.0
    # vertex 2: p0y = 0.005, height = 0.005 - 0.01 = -0.005 < 0
    #           vx = (0.2 - 0.0) / 0.1 = 2.0
    #           energy = 100 * 4.0 * 0.005 = 2.0
    # total: 13.0
    expected = 13.0

    assert abs(energy - expected) < 1e-5, f"energy mismatch: {energy} != {expected}"
