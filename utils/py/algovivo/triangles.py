from .utils import as_float_ptr, as_int_ptr
import torch
import ctypes

class Triangles:
    def __init__(self, lib):
        self.lib = lib
        self.indices = None
        self.rsi = None
        self.mu = None
        self.lambd = None
        self.simplex_order = 3

    def ctypes_argtypes(self):
        return [
            ctypes.c_int, # num_triangles
            ctypes.POINTER(ctypes.c_int), # indices
            ctypes.POINTER(ctypes.c_float), # rsi
            ctypes.POINTER(ctypes.c_float), # mu
            ctypes.POINTER(ctypes.c_float), # lambda
        ]

    def to_step_args(self):
        return [
            self.num_triangles,
            as_int_ptr(self.indices),
            as_float_ptr(self.rsi),
            as_float_ptr(self.mu),
            as_float_ptr(self.lambd),
        ]

    @property
    def num_elements(self):
        if self.indices is None:
            return 0
        return self.indices.shape[0]
    
    @property
    def num_triangles(self):
        return self.num_elements
    
    def set(self, indices=None, pos=None, rsi=None):
        if pos is not None and isinstance(pos, list):
            pos = torch.tensor(pos, dtype=torch.float32)
        if pos is not None:
            assert isinstance(pos, torch.Tensor)

        self.indices = torch.tensor(indices, dtype=torch.int32)

        if rsi is not None and isinstance(rsi, list):
            rsi = torch.tensor(rsi, dtype=torch.float32)
        
        if rsi is not None:
            assert isinstance(rsi, torch.Tensor)
            assert rsi.shape == (self.num_triangles, self.simplex_order - 1, self.simplex_order - 1)
            self.rsi = rsi
        else:
            num_vertices = len(pos)

            self.rsi = torch.zeros(
                self.num_triangles,
                self.simplex_order - 1,
                self.simplex_order - 1,
                dtype=torch.float32
            )
            
            self.lib.rsi_of_pos(
                num_vertices,
                as_float_ptr(pos),
                self.num_triangles,
                as_int_ptr(self.indices),
                as_float_ptr(self.rsi),
            )

        self.mu = torch.empty(self.num_triangles, dtype=torch.float32)
        self.mu.fill_(500.0)

        self.lambd = torch.empty(self.num_triangles, dtype=torch.float32)
        self.lambd.fill_(5.0)