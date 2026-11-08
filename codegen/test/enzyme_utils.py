import os
import ctypes
import subprocess
import tempfile
from pathlib import Path
import pytest

csrc_dirpath = Path(__file__).parent.parent / "algovivo_codegen" / "csrc"

skip_enzyme_varname = "ALGOVIVO_SKIP_ENZYME"

requires_enzyme = pytest.mark.skipif(
    os.environ.get(skip_enzyme_varname) == "1",
    reason=f"{skip_enzyme_varname}=1"
)


def compile_with_enzyme(cpp_src, name="lib") -> ctypes.CDLL:
    missing = [varname for varname in ["ENZYME", "LLVM_BIN_DIR"] if not os.environ.get(varname)]
    if missing:
        pytest.fail(
            f"Enzyme tests require {' and '.join(missing)} to be set (see the llvm18-enzyme docker image), "
            f"set {skip_enzyme_varname}=1 to skip them explicitly",
            pytrace=False
        )

    llvm_bin_dirpath = Path(os.environ["LLVM_BIN_DIR"])
    enzyme_filepath = os.environ["ENZYME"]

    with tempfile.TemporaryDirectory() as tmp_dirname:
        tmp_dirpath = Path(tmp_dirname)
        cpp_path = tmp_dirpath / f"{name}.cpp"
        ll_path = tmp_dirpath / f"{name}.ll"
        ll_diff_path = tmp_dirpath / f"{name}.diff.ll"
        so_path = tmp_dirpath / f"{name}.so"
        cpp_path.write_text(cpp_src)

        commands = [
            [llvm_bin_dirpath / "clang++", "-I", csrc_dirpath, "-emit-llvm", "-c", "-S", cpp_path, "-o", ll_path],
            [llvm_bin_dirpath / "opt", ll_path, f"-load-pass-plugin={enzyme_filepath}", "-passes=enzyme", "-S", "-o", ll_diff_path],
            [llvm_bin_dirpath / "clang++", "-shared", "-fPIC", "-o", so_path, ll_diff_path]
        ]
        for command in commands:
            result = subprocess.run([str(c) for c in command], capture_output=True, text=True)
            assert result.returncode == 0, result.stderr

        return ctypes.CDLL(str(so_path))


def compile_energy_with_grad(fn, headers) -> ctypes.CDLL:
    includes = [f"#include \"{header}\"" for header in ["enzyme.h", "dim.h", *headers]]
    cpp_src = "\n".join([
        *includes,
        "namespace algovivo {",
        fn.codegen(),
        fn.make_backward_pass().codegen(),
        "}"
    ])
    lib = compile_with_enzyme(cpp_src, fn.name)
    getattr(lib, fn.name).restype = ctypes.c_float
    getattr(lib, f"{fn.name}_grad").restype = None
    return lib


def to_ctypes(t, value):
    if t == "float":
        return ctypes.c_float(value)
    if t == "int":
        return ctypes.c_int(value)
    if t == "float*":
        return (ctypes.c_float * len(value))(*value)
    if t == "int*":
        return (ctypes.c_int * len(value))(*value)
    raise ValueError(f"unsupported type {t}")


def energy_grad(lib, fn, values, wrt="pos"):
    differentiable_names = [arg.name for arg in fn.args.get_differentiable_args()]
    grad_buffers = {
        f"{name}_grad": to_ctypes("float*", [0.0] * len(values[name]))
        for name in differentiable_names
    }
    call_args = [
        grad_buffers[arg.name] if arg.name in grad_buffers else to_ctypes(arg.t, values[arg.name])
        for arg in fn.make_backward_pass().args
    ]
    getattr(lib, f"{fn.name}_grad")(*call_args)
    return list(grad_buffers[f"{wrt}_grad"])


def central_diff_grad(lib, fn, values, wrt="pos", eps=1e-2):
    energy_fn = getattr(lib, fn.name)

    def energy_at(x):
        return energy_fn(*[
            to_ctypes(arg.t, x if arg.name == wrt else values[arg.name])
            for arg in fn.args
        ])

    grad = []
    for j in range(len(values[wrt])):
        plus = list(values[wrt])
        minus = list(values[wrt])
        plus[j] += eps
        minus[j] -= eps
        grad.append((energy_at(plus) - energy_at(minus)) / (2 * eps))
    return grad


def assert_close(got, want, rtol=1e-2):
    assert len(got) == len(want), (got, want)
    for g, w in zip(got, want):
        assert abs(g - w) <= rtol * max(1.0, abs(w)), (got, want)


def assert_grad_matches_central_diff(lib, fn, values, wrt="pos"):
    grad = energy_grad(lib, fn, values, wrt)
    assert any(abs(g) > 1e-3 for g in grad), grad
    assert_close(grad, central_diff_grad(lib, fn, values, wrt))
    return grad
