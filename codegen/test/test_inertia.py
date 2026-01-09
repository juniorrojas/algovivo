import subprocess
import ctypes
import tempfile
from pathlib import Path
import algovivo_codegen

this_dirpath = Path(__file__).parent
codegen_dirpath = this_dirpath.parent
csrc_dirpath = codegen_dirpath / "algovivo_codegen" / "csrc"


def get_inertia_src():
    return """
for (int i = 0; i < num_vertices; i++) {
  accumulate_inertial_energy(
    inertial_energy,
    i,
    pos,
    vel0,
    pos0,
    h,
    vertex_mass,
    space_dim
  );
}
"""


def make_inertial_energy_fn(name="inertial_energy"):
    f = algovivo_codegen.Fun(name)
    f.args.add_arg("int", "space_dim")
    f.args.add_arg("float", "h")
    f.args.add_arg("int", "num_vertices")
    f.args.add_arg("float*", "pos0")
    f.args.add_arg("float*", "vel0")
    f.args.add_arg("float*", "pos")
    f.args.add_arg("float", "vertex_mass")
    f.src_body = "float inertial_energy = 0.0;" + get_inertia_src() + "return inertial_energy;"
    return f


def test_inertial_energy_codegen():
    fn = make_inertial_energy_fn("inertial_energy")

    assert len(fn.args) == 7
    arg_names = [arg.name for arg in fn.args]
    assert "space_dim" in arg_names
    assert "h" in arg_names
    assert "num_vertices" in arg_names
    assert "pos0" in arg_names
    assert "vel0" in arg_names
    assert "pos" in arg_names
    assert "vertex_mass" in arg_names

    src = fn.codegen()

    assert "extern \"C\"" in src
    assert "float inertial_energy(" in src

    assert "float inertial_energy = 0.0;" in src
    assert "accumulate_inertial_energy(" in src
    assert "return inertial_energy;" in src


def compile_inertial_energy() -> ctypes.CDLL:
    fn = make_inertial_energy_fn("inertial_energy")
    generated_fn = fn.codegen()

    with open(csrc_dirpath / "dynamics" / "inertia.h") as f:
        inertia_h = f.read()

    cpp_src = inertia_h + "\nnamespace algovivo {\n" + generated_fn + "\n}"

    with tempfile.TemporaryDirectory() as tmp_dirname:
        cpp_path = Path(tmp_dirname) / "inertial_energy.cpp"
        so_path = Path(tmp_dirname) / "inertial_energy.so"

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
        lib.inertial_energy.argtypes = [
            ctypes.c_int,      # space_dim
            ctypes.c_float,    # h
            ctypes.c_int,      # num_vertices
            ctypes.POINTER(ctypes.c_float),  # pos0
            ctypes.POINTER(ctypes.c_float),  # vel0
            ctypes.POINTER(ctypes.c_float),  # pos
            ctypes.c_float,    # vertex_mass
        ]
        lib.inertial_energy.restype = ctypes.c_float

        return lib


def test_inertial_energy_forward():
    lib = compile_inertial_energy()
    if lib is None:
        raise RuntimeError("compilation failed")

    # test case: 2 vertices in 2D
    space_dim = 2
    h = 0.1
    num_vertices = 2
    vertex_mass = 1.0

    # vertex 0: pos0 = (0, 0), vel0 = (1, 0) -> predicted y = (0.1, 0)
    # vertex 1: pos0 = (1, 0), vel0 = (0, 1) -> predicted y = (1, 0.1)
    pos0 = (ctypes.c_float * 4)(
        0.0, 0.0,
        1.0, 0.0
    )
    vel0 = (ctypes.c_float * 4)(
        1.0, 0.0,
        0.0, 1.0
    )

    # vertex 0: pos = (0.2, 0) -> d = (0.1, 0), ||d||^2 = 0.01
    # vertex 1: pos = (1.2, 0.2) -> d = (0.2, 0.1), ||d||^2 = 0.05
    pos = (ctypes.c_float * 4)(
        0.2, 0.0,
        1.2, 0.2
    )

    energy = lib.inertial_energy(space_dim, h, num_vertices, pos0, vel0, pos, vertex_mass)

    # expected: m * ||d||^2 for each vertex
    # vertex 0: 1.0 * 0.01 = 0.01
    # vertex 1: 1.0 * 0.05 = 0.05
    # total: 0.06
    expected = 0.06

    assert abs(energy - expected) < 1e-5, f"energy mismatch: {energy} != {expected}"
