import ctypes
import torch

float_ptr_t = ctypes.POINTER(ctypes.c_float)
int_ptr_t = ctypes.POINTER(ctypes.c_int)

def as_float_ptr(x: torch.Tensor):
    if x is None:
        return None
    return ctypes.cast(x.data_ptr(), ctypes.POINTER(ctypes.c_float))
    
def as_int_ptr(x: torch.Tensor):
    if x is None:
        return None
    return ctypes.cast(x.data_ptr(), ctypes.POINTER(ctypes.c_int32))