import ctypes
from pathlib import Path
import os
this_filepath = Path(os.path.realpath(__file__))
this_dirpath = this_filepath.parent

def load_dynamic_lib(filename):
    if not os.path.exists(filename):
        raise FileNotFoundError(filename)
    lib = ctypes.cdll.LoadLibrary(filename)
    return lib

lib = load_dynamic_lib(
    str(this_dirpath.parent.parent.parent.joinpath("build", "algovivo.so"))
)

assert lib.l0_of_pos is not None