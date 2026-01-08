import subprocess
import ctypes
import tempfile
from pathlib import Path
import algovivo_codegen

this_dirpath = Path(__file__).parent
codegen_dirpath = this_dirpath.parent
csrc_dirpath = codegen_dirpath / "algovivo_codegen" / "csrc"


def get_inertia_only_loss_src():
    return """
float inertial_energy = 0.0;
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
return 0.5 * inertial_energy;
"""


def make_inertia_only_loss_fn(name="inertia_only_loss"):
    f = algovivo_codegen.Fun(name)
    f.args.add_arg("int", "space_dim")
    f.args.add_arg("float", "h")
    f.args.add_arg("int", "num_vertices")
    f.args.add_arg("float*", "pos0")
    f.args.add_arg("float*", "vel0")
    f.args.add_arg("float*", "pos")
    f.args.add_arg("float", "vertex_mass")
    f.src_body = get_inertia_only_loss_src()
    return f


def test_inertia_only_loss_codegen():
    fn = make_inertia_only_loss_fn()

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
    assert "float inertia_only_loss(" in src
    assert "float inertial_energy = 0.0;" in src
    assert "accumulate_inertial_energy(" in src
    assert "return 0.5 * inertial_energy;" in src


def compile_inertia_only_loss() -> ctypes.CDLL:
    fn = make_inertia_only_loss_fn()
    generated_fn = fn.codegen()

    with open(csrc_dirpath / "dynamics" / "inertia.h") as f:
        inertia_h = f.read()

    cpp_src = inertia_h + "\nnamespace algovivo {\n" + generated_fn + "\n}"

    with tempfile.TemporaryDirectory() as tmp_dirname:
        cpp_path = Path(tmp_dirname) / "inertia_only_loss.cpp"
        so_path = Path(tmp_dirname) / "inertia_only_loss.so"

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
        lib.inertia_only_loss.argtypes = [
            ctypes.c_int,      # space_dim
            ctypes.c_float,    # h
            ctypes.c_int,      # num_vertices
            ctypes.POINTER(ctypes.c_float),  # pos0
            ctypes.POINTER(ctypes.c_float),  # vel0
            ctypes.POINTER(ctypes.c_float),  # pos
            ctypes.c_float,    # vertex_mass
        ]
        lib.inertia_only_loss.restype = ctypes.c_float

        return lib


def test_inertia_only_loss_forward():
    lib = compile_inertia_only_loss()
    if lib is None:
        raise RuntimeError("compilation failed")

    # test case: 2 vertices in 2D
    space_dim = 2
    h = 0.1
    num_vertices = 2
    vertex_mass = 1.0

    pos0 = (ctypes.c_float * 4)(
        0.0, 0.0,
        1.0, 0.0
    )
    vel0 = (ctypes.c_float * 4)(
        1.0, 0.0,
        0.0, 1.0
    )

    # predicted positions: y = pos0 + h * vel0
    # vertex 0: (0.1, 0)
    # vertex 1: (1, 0.1)

    # case 1: pos == predicted (loss should be 0)
    pos_at_predicted = (ctypes.c_float * 4)(
        0.1, 0.0,
        1.0, 0.1
    )
    loss = lib.inertia_only_loss(space_dim, h, num_vertices, pos0, vel0, pos_at_predicted, vertex_mass)
    assert abs(loss) < 1e-5, f"loss at predicted should be 0, got {loss}"

    # case 2: pos != predicted
    pos_displaced = (ctypes.c_float * 4)(
        0.2, 0.0,
        1.2, 0.2
    )
    # vertex 0: d = (0.1, 0), ||d||^2 = 0.01
    # vertex 1: d = (0.2, 0.1), ||d||^2 = 0.05
    # inertial_energy = m * (0.01 + 0.05) = 0.06
    # loss = 0.5 * 0.06 = 0.03
    loss = lib.inertia_only_loss(space_dim, h, num_vertices, pos0, vel0, pos_displaced, vertex_mass)
    expected = 0.03
    assert abs(loss - expected) < 1e-5, f"loss mismatch: {loss} != {expected}"


def test_inertia_only_loss_minimized_at_predicted():
    lib = compile_inertia_only_loss()
    if lib is None:
        raise RuntimeError("compilation failed")

    # test case: 1 vertex in 2D
    space_dim = 2
    h = 0.1
    num_vertices = 1
    vertex_mass = 1.0

    pos0 = (ctypes.c_float * 2)(0.0, 0.0)
    vel0 = (ctypes.c_float * 2)(1.0, 2.0)

    # predicted: (0.1, 0.2)
    predicted = (ctypes.c_float * 2)(0.1, 0.2)

    loss_at_predicted = lib.inertia_only_loss(space_dim, h, num_vertices, pos0, vel0, predicted, vertex_mass)

    # test that loss at predicted is less than loss at nearby points
    offsets = [0.01, -0.01, 0.05, -0.05]
    for dx in offsets:
        for dy in offsets:
            nearby = (ctypes.c_float * 2)(0.1 + dx, 0.2 + dy)
            loss_nearby = lib.inertia_only_loss(space_dim, h, num_vertices, pos0, vel0, nearby, vertex_mass)
            assert loss_at_predicted <= loss_nearby, f"loss at predicted ({loss_at_predicted}) should be <= loss at ({0.1+dx}, {0.2+dy}) ({loss_nearby})"
