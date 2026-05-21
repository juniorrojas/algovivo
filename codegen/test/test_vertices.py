import subprocess
import ctypes
import tempfile
from pathlib import Path
import algovivo_codegen
from algovivo_codegen.codegen import Args


def test_update_args():
    vertices = algovivo_codegen.modules.Vertices()
    args = Args()
    vertices.add_update_args(args)
    arg_names = [arg.name for arg in args]
    assert "num_fixed_vertices" in arg_names
    assert "fixed_vertex_ids" in arg_names


def test_update_pos_args():
    vertices = algovivo_codegen.modules.Vertices()
    args = Args()
    vertices.add_update_pos_args(args)
    arg_names = [arg.name for arg in args]
    assert "num_fixed_vertices" in arg_names
    assert "fixed_vertex_ids" in arg_names


def test_optim_init_args():
    vertices = algovivo_codegen.modules.Vertices()
    args = Args()
    vertices.add_optim_init_args(args)
    arg_names = [arg.name for arg in args]
    assert "num_fixed_vertices" in arg_names
    assert "fixed_vertex_ids" in arg_names


def make_optim_init_src(name="optim_init"):
    vertices = algovivo_codegen.modules.Vertices()
    args = Args()
    vertices.add_optim_init_args(args)
    signature = args.codegen_fun_signature()
    body = vertices.get_optim_init_src().replace(" \\", "")
    return f"""extern \"C\"
void {name}({signature}) {{
  {body}
}}"""


def compile_optim_init() -> ctypes.CDLL:
    generated_fn = make_optim_init_src()

    cpp_src = "namespace algovivo {\n" + generated_fn + "\n}"

    with tempfile.TemporaryDirectory() as tmp_dirname:
        cpp_path = Path(tmp_dirname) / "optim_init.cpp"
        so_path = Path(tmp_dirname) / "optim_init.so"

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
        lib.optim_init.argtypes = [
            ctypes.c_int,                    # space_dim
            ctypes.c_float,                  # h
            ctypes.c_int,                    # num_vertices
            ctypes.POINTER(ctypes.c_float),  # pos0
            ctypes.POINTER(ctypes.c_float),  # vel0
            ctypes.POINTER(ctypes.c_float),  # pos
            ctypes.c_int,                    # num_fixed_vertices
            ctypes.POINTER(ctypes.c_int),    # fixed_vertex_ids
        ]
        lib.optim_init.restype = None
        return lib


def test_optim_init_no_fixed_vertices():
    lib = compile_optim_init()
    if lib is None:
        raise RuntimeError("compilation failed")

    space_dim = 2
    h = 0.1
    num_vertices = 3

    pos0 = (ctypes.c_float * 6)(0.0, 0.0, 1.0, 0.0, 2.0, 0.0)
    vel0 = (ctypes.c_float * 6)(1.0, 2.0, 0.0, 1.0, -1.0, 3.0)
    pos = (ctypes.c_float * 6)()

    lib.optim_init(space_dim, h, num_vertices, pos0, vel0, pos, 0, None)

    # all vertices follow the inertial guess pos0 + h * vel0
    expected = [0.1, 0.2, 1.0, 0.1, 1.9, 0.3]
    for i in range(6):
        assert abs(pos[i] - expected[i]) < 1e-5, f"pos[{i}] mismatch: {pos[i]} != {expected[i]}"


def test_optim_init_with_fixed_vertices():
    lib = compile_optim_init()
    if lib is None:
        raise RuntimeError("compilation failed")

    space_dim = 2
    h = 0.1
    num_vertices = 3

    pos0 = (ctypes.c_float * 6)(0.0, 0.0, 1.0, 0.0, 2.0, 0.0)
    vel0 = (ctypes.c_float * 6)(1.0, 2.0, 0.0, 1.0, -1.0, 3.0)
    pos = (ctypes.c_float * 6)()

    # fix vertices 0 and 2 back to pos0; vertex 1 follows inertia
    fixed_vertex_ids = (ctypes.c_int * 2)(0, 2)
    lib.optim_init(space_dim, h, num_vertices, pos0, vel0, pos, 2, fixed_vertex_ids)

    expected = [
        0.0, 0.0,
        1.0, 0.1,
        2.0, 0.0,
    ]
    for i in range(6):
        assert abs(pos[i] - expected[i]) < 1e-5, f"pos[{i}] mismatch: {pos[i]} != {expected[i]}"
