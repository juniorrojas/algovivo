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

    with open(csrc_dirpath / "potentials" / "gravity.h") as f:
        gravity_h = f.read()

    cpp_src = gravity_h + "\nnamespace algovivo {\n" + generated_fn + "\n}"

    with tempfile.TemporaryDirectory() as tmp_dirname:
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


def test_gravity_energy_grad_codegen():
    gravity = algovivo_codegen.potentials.Gravity()
    fn = gravity.make_energy_fn("gravity_energy")
    grad_fn = fn.make_backward_pass()

    src = grad_fn.codegen()

    assert "extern \"C\"" in src
    assert "void gravity_energy_grad(" in src
    assert "__enzyme_autodiff(" in src
    assert "enzyme_const" in src
    assert "enzyme_dup" in src
    assert "pos_grad" in src


def test_gravity_energy_grad():
    import os
    import sys

    gravity = algovivo_codegen.potentials.Gravity()
    fn = gravity.make_energy_fn("gravity_energy")
    grad_fn = fn.make_backward_pass()

    forward_src = fn.codegen()
    backward_src = grad_fn.codegen()

    with open(csrc_dirpath / "potentials" / "gravity.h") as f:
        gravity_h = f.read()

    with open(csrc_dirpath / "enzyme.h") as f:
        enzyme_h = f.read()

    cpp_src = enzyme_h + "\n" + gravity_h + "\nnamespace algovivo {\n" + forward_src + "\n\n" + backward_src + "\n}"

    # generate test script to run inside Docker
    test_script = '''
import ctypes

lib = ctypes.CDLL("/workspace/gravity_energy.so")

lib.gravity_energy.argtypes = [
    ctypes.c_int,
    ctypes.c_float,
    ctypes.c_int,
    ctypes.POINTER(ctypes.c_float),
    ctypes.c_float,
]
lib.gravity_energy.restype = ctypes.c_float

lib.gravity_energy_grad.argtypes = [
    ctypes.c_int,
    ctypes.c_float,
    ctypes.c_int,
    ctypes.POINTER(ctypes.c_float),
    ctypes.POINTER(ctypes.c_float),
    ctypes.c_float,
]
lib.gravity_energy_grad.restype = None

space_dim = 2
g = 9.8
num_vertices = 2
vertex_mass = 1.5

pos = (ctypes.c_float * 4)(0.0, 1.0, 0.0, 2.0)
pos_grad = (ctypes.c_float * 4)(0.0, 0.0, 0.0, 0.0)

lib.gravity_energy_grad(space_dim, g, num_vertices, pos, pos_grad, vertex_mass)

# expected: dE/dy = m * g = 14.7, dE/dx = 0
assert abs(pos_grad[0] - 0.0) < 1e-5, f"pos_grad[0] mismatch: {pos_grad[0]}"
assert abs(pos_grad[1] - 14.7) < 1e-5, f"pos_grad[1] mismatch: {pos_grad[1]}"
assert abs(pos_grad[2] - 0.0) < 1e-5, f"pos_grad[2] mismatch: {pos_grad[2]}"
assert abs(pos_grad[3] - 14.7) < 1e-5, f"pos_grad[3] mismatch: {pos_grad[3]}"

print("gradient test passed")
'''

    with tempfile.TemporaryDirectory() as tmp_dirname:
        tmp_path = Path(tmp_dirname)

        with open(tmp_path / "gravity_energy.cpp", "w") as f:
            f.write(cpp_src)

        with open(tmp_path / "test_grad.py", "w") as f:
            f.write(test_script)

        docker_image = "ghcr.io/juniorrojas/algovivo/llvm18-enzyme:latest"
        uid = os.getuid()
        gid = os.getgid()

        # build and test inside Docker
        build_and_test_cmd = """
set -e
$LLVM_BIN_DIR/clang++ -emit-llvm -c -S gravity_energy.cpp -o gravity_energy.ll
$LLVM_BIN_DIR/opt gravity_energy.ll -load-pass-plugin=$ENZYME -passes=enzyme -S -o gravity_energy.diff.ll
$LLVM_BIN_DIR/clang++ -shared -fPIC -o gravity_energy.so gravity_energy.diff.ll
python3 test_grad.py
"""

        result = subprocess.run(
            [
                "docker", "run", "--rm",
                "--user", f"{uid}:{gid}",
                "-v", f"{tmp_path}:/workspace",
                "-w", "/workspace",
                docker_image,
                "sh", "-c", build_and_test_cmd
            ],
            capture_output=True, text=True
        )

        if result.returncode != 0:
            print("stdout:", result.stdout)
            print("stderr:", result.stderr)
            raise AssertionError(f"gradient test failed: {result.stderr}")
