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
    f.args.add_differentiable_arg("float*", "x", num_elements="n")
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
int minimize(
  float k, int n, const float* t, float* x, float* x_grad, float* x_tmp,
  int max_optim_iters, float initial_step_size, float backtracking_scale,
  int max_line_search_iters, float grad_q_tol
) {{
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
        lib.minimize.argtypes = (
            [ctypes.c_float, ctypes.c_int] + [float_p] * 4 +
            [ctypes.c_int, ctypes.c_float, ctypes.c_float, ctypes.c_int, ctypes.c_float]
        )
        lib.minimize.restype = ctypes.c_int
        return lib


def run_minimize(lib, target, k=2.0, grad_q_tol=0.5 * 1e-5):
    n = len(target)
    t = (ctypes.c_float * n)(*target)
    x = (ctypes.c_float * n)(*([0.0] * n))
    x_grad = (ctypes.c_float * n)()
    x_tmp = (ctypes.c_float * n)()

    lib.minimize(
        ctypes.c_float(k), n, t, x, x_grad, x_tmp,
        100, ctypes.c_float(1.0), ctypes.c_float(0.3), 20, ctypes.c_float(grad_q_tol)
    )
    return list(x)


def test_generated_optimizer_minimizes_a_quadratic():
    lib = compile_minimize()

    k = 2.0
    target = [1.5, -2.0, 0.25, 3.0]
    got = run_minimize(lib, target, k=k)

    tol = (0.5e-5) ** 0.5 / k
    for g, want in zip(got, target):
        assert abs(g - want) < tol, (got, target, tol)


def test_grad_q_tol_is_a_runtime_argument():
    lib = compile_minimize()

    target = [1.5, -2.0, 0.25, 3.0]

    loose = run_minimize(lib, target, grad_q_tol=0.5 * 1e-5)
    tight = run_minimize(lib, target, grad_q_tol=1e-12)

    loose_residual = max(abs(g - w) for g, w in zip(loose, target))
    tight_residual = max(abs(g - w) for g, w in zip(tight, target))

    assert tight_residual < loose_residual, (tight_residual, loose_residual)


def make_backward_euler():
    be = algovivo_codegen.BackwardEuler()
    be.modules = [
        algovivo_codegen.modules.Vertices(),
        algovivo_codegen.modules.Muscles(),
        algovivo_codegen.modules.Triangles(),
        algovivo_codegen.modules.Gravity(),
        algovivo_codegen.modules.Friction(),
        algovivo_codegen.modules.Collision()
    ]
    be.inertial_modules = [algovivo_codegen.modules.Vertices()]
    be.potentials = [
        algovivo_codegen.potentials.Muscles(),
        algovivo_codegen.potentials.Triangles(),
        algovivo_codegen.potentials.Gravity(),
        algovivo_codegen.potentials.Collision(),
        algovivo_codegen.potentials.Friction()
    ]
    return be


optimizer_arg_names = [
    "max_optim_iters",
    "initial_step_size",
    "backtracking_scale",
    "max_line_search_iters",
    "grad_q_tol"
]


def test_optimizer_args_come_last_in_the_generated_update():
    be = make_backward_euler()
    be.make_loss()
    update_args, update_pos_args, _ = be.make_update_args()

    assert [arg.name for arg in update_args][-5:] == optimizer_arg_names
    assert [arg.name for arg in update_pos_args][-5:] == optimizer_arg_names
