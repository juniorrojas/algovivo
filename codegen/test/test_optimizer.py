import subprocess
import ctypes
import tempfile
from pathlib import Path
import algovivo_codegen

csrc_dirpath = Path(__file__).parent.parent / "algovivo_codegen" / "csrc"


def make_quadratic():
    # f(x) = 0.5 * k * sum_i (x_i - t_i)^2, minimized at x = t
    f = algovivo_codegen.Fun("quadratic_energy")
    f.args.add_arg("float", "k")
    f.args.add_arg("int", "n")
    f.args.add_arg("float*", "t")
    f.args.add_arg("float*", "x", differentiable=True, size="n")
    f.src_body = """float energy = 0.0;
  for (int i = 0; i < n; i++) {
    const auto d = x[i] - t[i];
    energy += 0.5 * k * d * d;
  }
  return energy;"""
    return f


def compile_minimize() -> ctypes.CDLL:
    f = make_quadratic()
    optimizer = algovivo_codegen.GradientDescentWithBacktrackingLineSearch()

    cpp_src = "\n".join([
        (csrc_dirpath / "arr.h").read_text().replace("#pragma once", ""),
        "namespace algovivo {",
        f.codegen(),
        # TODO: generate gradient automatically instead of hand-writing it
        """extern "C"
void quadratic_energy_grad(float k, int n, const float* t, const float* x, const float* x_grad) {
  float* g = const_cast<float*>(x_grad);
  for (int i = 0; i < n; i++) g[i] += k * (x[i] - t[i]);
}""",
        optimizer.codegen(args=f.args, loss_fn=f.name).replace("#pragma once", ""),
        f"""extern "C"
int minimize(float k, int n, const float* t, float* x, float* x_grad, float* x_tmp) {{
  {algovivo_codegen.BackwardEuler().update_pos_body}
  return 0;
}}""",
        "}"
    ])

    with tempfile.TemporaryDirectory() as tmp_dirname:
        cpp_path = Path(tmp_dirname) / "minimize.cpp"
        so_path = Path(tmp_dirname) / "minimize.so"
        cpp_path.write_text(cpp_src)

        result = subprocess.run(
            ["clang++", "-shared", "-fPIC", "-nostdlib", "-o", str(so_path), str(cpp_path)],
            capture_output=True,
            text=True
        )
        assert result.returncode == 0, result.stderr

        lib = ctypes.CDLL(str(so_path))
        float_p = ctypes.POINTER(ctypes.c_float)
        # k, n, t, x, x_grad, x_tmp
        lib.minimize.argtypes = [ctypes.c_float, ctypes.c_int] + [float_p] * 4
        lib.minimize.restype = ctypes.c_int
        return lib


def test_generated_optimizer_minimizes_a_quadratic():
    lib = compile_minimize()

    k = 2.0
    target = [1.5, -2.0, 0.25, 3.0]
    n = len(target)
    t = (ctypes.c_float * n)(*target)
    x = (ctypes.c_float * n)(*([0.0] * n))
    x_grad = (ctypes.c_float * n)()
    x_tmp = (ctypes.c_float * n)()

    lib.minimize(ctypes.c_float(k), n, t, x, x_grad, x_tmp)

    # optim_converged stops at max squared grad component < 0.5e-5, and
    # grad = k * (x - t), which bounds how close x can be required to get
    tol = (0.5e-5) ** 0.5 / k
    for got, want in zip(list(x), target):
        assert abs(got - want) < tol, (list(x), target, tol)
