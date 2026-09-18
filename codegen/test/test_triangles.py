import subprocess
import ctypes
import tempfile
from pathlib import Path
import algovivo_codegen

this_dirpath = Path(__file__).parent
codegen_dirpath = this_dirpath.parent
csrc_dirpath = codegen_dirpath / "algovivo_codegen" / "csrc"


def make_energy_fn():
    fn = algovivo_codegen.Fun("triangle_energy")
    fn.args.add_arg("int", "num_triangles")
    fn.args.add_arg("int*", "triangles")
    fn.args.add_arg("float*", "rsi")
    fn.args.add_arg("float*", "mu")
    fn.args.add_arg("float*", "lambda")
    fn.args.add_arg("float*", "pos")

    neohookean = algovivo_codegen.Neohookean(
        simplex_order=3,
        simplex_name_singular="triangle"
    )
    fn.src_body = (
        "float potential_energy = 0.0;"
        + neohookean.codegen_accumulate_simplices_energy()
        + "return potential_energy;"
    )
    return fn


def compile_triangle_energy() -> ctypes.CDLL:
    with open(csrc_dirpath / "potentials" / "triangles.h") as f:
        triangles_h = f.read()

    cpp_src = triangles_h + "\nnamespace algovivo {\n" + make_energy_fn().codegen() + "\n}"

    with tempfile.TemporaryDirectory() as tmp_dirname:
        tmp_dirpath = Path(tmp_dirname)
        potentials_dirpath = tmp_dirpath / "potentials"
        potentials_dirpath.mkdir()

        for header in ["vec2.h", "mat2x2.h"]:
            with open(csrc_dirpath / header) as f:
                with open(tmp_dirpath / header, "w") as out:
                    out.write(f.read())

        cpp_path = potentials_dirpath / "triangle_energy.cpp"
        so_path = tmp_dirpath / "triangle_energy.so"

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
        float_p = ctypes.POINTER(ctypes.c_float)
        int_p = ctypes.POINTER(ctypes.c_int)

        lib.rsi_of_pos.argtypes = [float_p, ctypes.c_int, int_p, float_p]
        lib.rsi_of_pos.restype = None

        lib.triangle_energy.argtypes = [
            ctypes.c_int,  # num_triangles
            int_p,         # triangles
            float_p,       # rsi
            float_p,       # mu
            float_p,       # lambda
            float_p        # pos
        ]
        lib.triangle_energy.restype = ctypes.c_float

        return lib


def test_triangle_energy():
    lib = compile_triangle_energy()
    if lib is None:
        raise RuntimeError("compilation failed")

    triangles = (ctypes.c_int * 3)(0, 1, 2)
    mu = (ctypes.c_float * 1)(500.0)
    lam = (ctypes.c_float * 1)(50.0)

    rest_pos = (ctypes.c_float * 6)(
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0
    )
    rsi = (ctypes.c_float * 4)()
    lib.rsi_of_pos(rest_pos, 1, triangles, rsi)

    undeformed_energy = lib.triangle_energy(1, triangles, rsi, mu, lam, rest_pos)
    assert abs(undeformed_energy) < 1e-5, undeformed_energy

    stretched_pos = (ctypes.c_float * 6)(
        0.0, 0.0,
        2.0, 0.0,
        0.0, 1.0
    )
    deformed_energy = lib.triangle_energy(1, triangles, rsi, mu, lam, stretched_pos)
    assert deformed_energy > 1e-3, deformed_energy