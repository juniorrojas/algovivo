from .vertices import Vertices
from .muscles import Muscles
from .triangles import Triangles

class System:
    def __init__(self, native_instance):
        self.native_instance = native_instance

        self.h = 0.033

        self.vertices = Vertices()
        self.muscles = Muscles(native_instance.lib)
        self.triangles = Triangles(native_instance.lib)

        self.k_friction = float(300)

    @property
    def space_dim(self):
        return 2

    @property
    def num_vertices(self):
        return self.vertices.num_vertices
    
    @property
    def num_muscles(self):
        return self.muscles.num_muscles

    @property
    def num_triangles(self):
        return self.triangles.num_triangles

    def set(self, pos=None, muscles=None, muscles_l0=None, triangles=None, triangles_rsi=None):
        self.vertices.set(pos)
        self.muscles.set(indices=muscles, pos=pos, l0=muscles_l0)
        self.triangles.set(indices=triangles, pos=pos, rsi=triangles_rsi)

    def step(self):
        g = 9.8
        h = self.h

        self.native_instance.lib.backward_euler_update(
            2, # 2D
            g,
            h,

            *self.vertices.to_step_args(),

            *self.muscles.to_step_args(),

            *self.triangles.to_step_args(),

            self.k_friction
        )

        if self.num_vertices != 0:
            self.vertices.pos0.data.copy_(self.vertices.pos1)
            self.vertices.vel0.data.copy_(self.vertices.vel1)