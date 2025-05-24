import torch
from .utils import as_float_ptr, as_int_ptr

class Vertices:
    def __init__(self, space_dim=2):
        self.vertex_mass = 6.0714287757873535
        self.pos0 = None
        self.vel0 = None
        self.pos1 = None
        self.vel1 = None
        self.pos_grad = None
        self.pos_tmp = None
        self.space_dim = space_dim

    @property
    def pos(self):
        return self.pos0
    
    @property
    def vel(self):
        return self.vel0

    def set(self, pos):
        if pos is None:
            raise ValueError("pos required")
        
        num_vertices = len(pos)
        pos_tensor = torch.tensor(pos, dtype=torch.float32)

        if self.pos0 is not None:
            self.pos0 = None
        self.pos0 = pos_tensor

        if self.pos1 is not None:
            self.pos1 = None
        self.pos1 = torch.zeros((num_vertices, self.space_dim), dtype=torch.float32)

        if self.vel0 is not None:
            self.vel0 = None
        self.vel0 = torch.zeros((num_vertices, self.space_dim), dtype=torch.float32)

        if self.vel1 is not None:
            self.vel1 = None
        self.vel1 = torch.zeros((num_vertices, self.space_dim), dtype=torch.float32)

        self.update_tmp_buffers()

    def update_tmp_buffers(self):
        if self.pos0 is None:
            raise ValueError("pos0 required")
        
        num_vertices = self.pos0.shape[0]
        space_dim = self.space_dim

        self.pos_grad = torch.zeros((num_vertices, space_dim), dtype=torch.float32)
        self.pos_tmp = torch.zeros((num_vertices, space_dim), dtype=torch.float32)

    @property
    def num_vertices(self):
        if self.pos0 is None:
            return 0
        return self.pos0.shape[0]

    def to_step_args(self):
        return [
            self.num_vertices,
            as_float_ptr(self.pos0),
            as_float_ptr(self.vel0),
            self.vertex_mass,
            
            None, # fixed vertex
            
            as_float_ptr(self.pos1),
            as_float_ptr(self.pos_grad),
            as_float_ptr(self.pos_tmp),
            as_float_ptr(self.vel1)
        ]