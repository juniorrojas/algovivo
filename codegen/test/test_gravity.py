import subprocess
import ctypes
import tempfile
from pathlib import Path
import algovivo_codegen
from enzyme_utils import requires_enzyme, compile_with_enzyme, central_diff_grad

this_dirpath = Path(__file__).parent
codegen_dirpath = this_dirpath.parent
csrc_dirpath = codegen_dirpath / "algovivo_codegen" / "csrc"


def test_gravity_energy_codegen():
    gravity = algovivo_codegen.potentials.Gravity()
    fn = gravity.make_energy_fn("gravity_energy")

    assert len(fn.args) == 4
    arg_names = [arg.name for arg in fn.args]
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

    with open(csrc_dirpath / "potentials" / "gravity.h") as f:
        gravity_h = f.read()

    cpp_src = "#include \"dim.h\"\n" + gravity_h + "\nnamespace algovivo {\n" + generated_fn + "\n}"

    with tempfile.TemporaryDirectory() as tmp_dirname:
        with open(csrc_dirpath / "dim.h") as f:
            dim_h = f.read()
        with open(Path(tmp_dirname) / "dim.h", "w") as f:
            f.write(dim_h)

        cpp_path = Path(tmp_dirname) / "gravity_energy.cpp"
        so_path = Path(tmp_dirname) / "gravity_energy.so"

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
        lib.gravity_energy.argtypes = [
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
    g = 9.8
    num_vertices = 2
    vertex_mass = 1.0
    
    pos = (ctypes.c_float * 4)(
        0.0, 1.0,
        0.0, 2.0
    )

    energy = lib.gravity_energy(g, num_vertices, pos, vertex_mass)

    # expected: m * g * y for each vertex
    # vertex 0: 1.0 * 9.8 * 1.0 = 9.8
    # vertex 1: 1.0 * 9.8 * 2.0 = 19.6
    # total: 29.4
    expected = 29.4

    assert abs(energy - expected) < 1e-5, f"energy mismatch: {energy} != {expected}"


def compile_gravity_energy_with_grad() -> ctypes.CDLL:
    fn = algovivo_codegen.potentials.Gravity().make_energy_fn("gravity_energy")
    cpp_src = "\n".join([
        (csrc_dirpath / "enzyme.h").read_text(),
        (csrc_dirpath / "dim.h").read_text(),
        (csrc_dirpath / "potentials" / "gravity.h").read_text(),
        "namespace algovivo {",
        fn.codegen(),
        fn.make_backward_pass().codegen(),
        "}"
    ]).replace("#pragma once", "")

    lib = compile_with_enzyme(cpp_src, "gravity_energy")
    float_p = ctypes.POINTER(ctypes.c_float)
    lib.gravity_energy.argtypes = [ctypes.c_float, ctypes.c_int, float_p, ctypes.c_float]
    lib.gravity_energy.restype = ctypes.c_float
    lib.gravity_energy_grad.argtypes = [ctypes.c_float, ctypes.c_int, float_p, float_p, ctypes.c_float]
    lib.gravity_energy_grad.restype = None
    return lib


@requires_enzyme
def test_gravity_energy_grad():
    lib = compile_gravity_energy_with_grad()

    g = 9.8
    vertex_mass = 1.5
    pos_values = [0.0, 1.0, 3.0, 2.0, -1.0, 0.5]
    num_vertices = len(pos_values) // 2
    n = len(pos_values)

    pos = (ctypes.c_float * n)(*pos_values)
    pos_grad = (ctypes.c_float * n)()
    lib.gravity_energy_grad(g, num_vertices, pos, pos_grad, vertex_mass)

    expected = [0.0, vertex_mass * g] * num_vertices
    for got, want in zip(pos_grad, expected):
        assert abs(got - want) < 1e-5, (list(pos_grad), expected)

    finite_diff = central_diff_grad(
        lambda p: lib.gravity_energy(g, num_vertices, p, vertex_mass),
        pos_values
    )
    for got, want in zip(pos_grad, finite_diff):
        assert abs(got - want) < 1e-2, (list(pos_grad), finite_diff)
