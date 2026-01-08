import subprocess
import ctypes
import tempfile
from pathlib import Path
import algovivo_codegen

this_dirpath = Path(__file__).parent
codegen_dirpath = this_dirpath.parent
csrc_dirpath = codegen_dirpath / "algovivo_codegen" / "csrc"


def test_gravity_energy_codegen():
    gravity = algovivo_codegen.potentials.Gravity()
    fn = gravity.make_energy_fn("gravity_energy")

    assert len(fn.args) == 5
    arg_names = [arg.name for arg in fn.args]
    assert "space_dim" in arg_names
    assert "g" in arg_names
    assert "num_vertices" in arg_names
    assert "pos" in arg_names
    assert "vertex_mass" in arg_names

    src = fn.codegen()

    assert "extern \"C\"" in src
    assert "float gravity_energy(" in src
    
    assert "float potential_energy = 0.0;" in src
    assert "accumulate_gravity_energy(" in src
    assert "return potential_energy;" in src


def compile_gravity_energy() -> ctypes.CDLL:
    gravity = algovivo_codegen.potentials.Gravity()
    fn = gravity.make_energy_fn("gravity_energy")
    generated_fn = fn.codegen()

    # read the helper (single-vertex) function from csrc
    with open(csrc_dirpath / "potentials" / "gravity.h") as f:
        gravity_h = f.read()

    # combine helper + generated function
    cpp_src = gravity_h + "\nnamespace algovivo {\n" + generated_fn + "\n}"

    with tempfile.TemporaryDirectory() as tmp_dirname:
        cpp_path = Path(tmp_dirname) / "gravity_energy.cpp"
        so_path = Path(tmp_dirname) / "gravity_energy.so"

        with open(cpp_path, "w") as f:
            f.write(cpp_src)

        # compile to shared library
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

        # load and return the library
        lib = ctypes.CDLL(str(so_path))
        lib.gravity_energy.argtypes = [
            ctypes.c_int,      # space_dim
            ctypes.c_float,    # g
            ctypes.c_int,      # num_vertices
            ctypes.POINTER(ctypes.c_float),  # pos
            ctypes.c_float,    # vertex_mass
        ]
        lib.gravity_energy.restype = ctypes.c_float

        return lib


def test_gravity_energy_forward():
    lib = compile_gravity_energy()
    if lib is None:
        raise RuntimeError("compilation failed")

    # test case: 2 vertices in 2D
    space_dim = 2
    g = 9.8
    num_vertices = 2
    vertex_mass = 1.0
    
    pos = (ctypes.c_float * 4)(
        0.0, 1.0,
        0.0, 2.0
    )

    energy = lib.gravity_energy(space_dim, g, num_vertices, pos, vertex_mass)

    # expected: m * g * y for each vertex
    # vertex 0: 1.0 * 9.8 * 1.0 = 9.8
    # vertex 1: 1.0 * 9.8 * 2.0 = 19.6
    # total: 29.4
    expected = 29.4

    assert abs(energy - expected) < 1e-5, f"energy mismatch: {energy} != {expected}"
