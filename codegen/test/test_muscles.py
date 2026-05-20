import subprocess
import ctypes
import tempfile
from pathlib import Path
import algovivo_codegen

this_dirpath = Path(__file__).parent
codegen_dirpath = this_dirpath.parent
csrc_dirpath = codegen_dirpath / "algovivo_codegen" / "csrc"


def test_muscle_energy_codegen():
    muscles = algovivo_codegen.potentials.Muscles()
    fn = muscles.make_energy_fn("muscle_energy")

    assert len(fn.args) == 6
    arg_names = [arg.name for arg in fn.args]
    assert "k" in arg_names
    assert "num_muscles" in arg_names
    assert "muscles" in arg_names
    assert "a" in arg_names
    assert "l0" in arg_names
    assert "pos" in arg_names

    src = fn.codegen()

    assert "extern \"C\"" in src
    assert "float muscle_energy(" in src

    assert "float potential_energy = 0.0;" in src
    assert "accumulate_muscle_energy(" in src
    assert "return potential_energy;" in src


def compile_muscle_energy() -> ctypes.CDLL:
    muscles = algovivo_codegen.potentials.Muscles()
    fn = muscles.make_energy_fn("muscle_energy")
    generated_fn = fn.codegen()

    with open(csrc_dirpath / "potentials" / "muscles.h") as f:
        muscles_h = f.read()

    cpp_src = muscles_h + "\nnamespace algovivo {\n" + generated_fn + "\n}"

    with tempfile.TemporaryDirectory() as tmp_dirname:
        # muscles.h includes "../vec2.h", so place the source in a
        # potentials/ subdir and copy vec2.h alongside its parent
        potentials_dirpath = Path(tmp_dirname) / "potentials"
        potentials_dirpath.mkdir()

        with open(csrc_dirpath / "vec2.h") as f:
            vec2_h = f.read()
        with open(Path(tmp_dirname) / "vec2.h", "w") as f:
            f.write(vec2_h)

        cpp_path = potentials_dirpath / "muscle_energy.cpp"
        so_path = Path(tmp_dirname) / "muscle_energy.so"

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
        lib.muscle_energy.argtypes = [
            ctypes.c_float,    # k
            ctypes.c_int,      # num_muscles
            ctypes.POINTER(ctypes.c_int),    # muscles
            ctypes.POINTER(ctypes.c_float),  # a
            ctypes.POINTER(ctypes.c_float),  # l0
            ctypes.POINTER(ctypes.c_float),  # pos
        ]
        lib.muscle_energy.restype = ctypes.c_float

        return lib


def test_muscle_energy_forward():
    lib = compile_muscle_energy()
    if lib is None:
        raise RuntimeError("compilation failed")

    # test case: single muscle between 2 vertices in 2D
    k = 4.0
    num_muscles = 1

    muscles = (ctypes.c_int * 2)(0, 1)

    # rest length 2.0, contracted to a = 0.5 -> al0 = 1.0
    a = (ctypes.c_float * 1)(0.5)
    l0 = (ctypes.c_float * 1)(2.0)

    # vertices 2.0 apart -> current length l = 2.0
    pos = (ctypes.c_float * 4)(
        0.0, 0.0,
        0.0, 2.0
    )

    energy = lib.muscle_energy(k, num_muscles, muscles, a, l0, pos)

    # l ~= 2.0, al0 = a * l0 = 1.0
    # dl = (l - al0) / al0 = 1.0
    # energy = 0.5 * k * dl^2 = 0.5 * 4.0 * 1.0 = 2.0
    expected = 2.0

    assert abs(energy - expected) < 1e-4, f"energy mismatch: {energy} != {expected}"
