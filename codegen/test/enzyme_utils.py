import os
import ctypes
import subprocess
import tempfile
from pathlib import Path
import pytest

requires_enzyme = pytest.mark.skipif(
    not os.environ.get("ENZYME") or not os.environ.get("LLVM_BIN_DIR"),
    reason="requires ENZYME and LLVM_BIN_DIR, see the llvm18-enzyme docker image"
)


def compile_with_enzyme(cpp_src, name="lib") -> ctypes.CDLL:
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
            [llvm_bin_dirpath / "clang++", "-emit-llvm", "-c", "-S", cpp_path, "-o", ll_path],
            [llvm_bin_dirpath / "opt", ll_path, f"-load-pass-plugin={enzyme_filepath}", "-passes=enzyme", "-S", "-o", ll_diff_path],
            [llvm_bin_dirpath / "clang++", "-shared", "-fPIC", "-o", so_path, ll_diff_path]
        ]
        for command in commands:
            result = subprocess.run([str(c) for c in command], capture_output=True, text=True)
            assert result.returncode == 0, result.stderr

        return ctypes.CDLL(str(so_path))


def central_diff_grad(energy_fn, values, eps=1e-2):
    n = len(values)
    grad = []
    for j in range(n):
        plus = (ctypes.c_float * n)(*values)
        minus = (ctypes.c_float * n)(*values)
        plus[j] += eps
        minus[j] -= eps
        grad.append((energy_fn(plus) - energy_fn(minus)) / (2 * eps))
    return grad
