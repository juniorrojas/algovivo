from .utils import as_float_ptr, as_int_ptr
import torch

class Muscles:
    def __init__(self, lib):
        self.lib = lib
        self.indices = None
        self.k = float(90)
        self.a = None
        self.l0 = None
    
    def l_of_pos(self, num_vertices, pos, num_edges, edges, l0):
        self.lib.l0_of_pos(
            num_vertices,
            as_float_ptr(pos),
            num_edges,
            as_int_ptr(edges),
            as_float_ptr(l0)
        )

    @property
    def num_muscles(self):
        if self.indices is None:
            return 0
        return self.indices.shape[0]

    def to_step_args(self):
        num_muscles = self.num_muscles
        return [
            num_muscles,
            as_int_ptr(self.indices) if num_muscles > 0 else None,
            self.k,
            as_float_ptr(self.a) if num_muscles > 0 else None,
            as_float_ptr(self.l0) if num_muscles > 0 else None,
        ]
    
    def set(self, pos=None, indices=None, k=None, l0=None):
        if indices is None:
            raise ValueError("indices required")
        num_muscles = len(indices)

        if k is not None:
            self.k = k

        if pos is not None and isinstance(pos, list):
            pos = torch.tensor(pos, dtype=torch.float32)
        if pos is not None:
            assert isinstance(pos, torch.Tensor)

        indices = self.indices = torch.tensor(indices, dtype=torch.int32)

        if l0 is None:
            self.l0 = torch.empty(num_muscles, dtype=torch.float32)
            self.l_of_pos(num_muscles, pos, num_muscles, indices, self.l0)
        else:
            self.l0 = torch.tensor(l0, dtype=torch.float32)

        self.a = torch.ones(num_muscles, dtype=torch.float32)
        