import os
import ctypes

class NativeInstance:
    def __init__(self, lib):
        self.lib = lib

        lib.backward_euler_update.restype = None
        lib.backward_euler_update.argtypes = [
            ctypes.c_int,                    # space_dim
            ctypes.c_float,                  # g
            ctypes.c_float,                  # h
            
            ctypes.c_int,                    # num_vertices
            ctypes.POINTER(ctypes.c_float),  # pos0
            ctypes.POINTER(ctypes.c_float),  # vel0
            ctypes.c_float,                  # vertex_mass

            ctypes.POINTER(ctypes.c_int),    # fixed_vertex_id
            ctypes.POINTER(ctypes.c_float),  # pos1
            ctypes.POINTER(ctypes.c_float),  # pos_grad
            ctypes.POINTER(ctypes.c_float),  # pos_tmp
            ctypes.POINTER(ctypes.c_float),  # vel1

            ctypes.c_int,                    # num_muscles
            ctypes.POINTER(ctypes.c_int),    # muscles
            ctypes.c_float,                  # k
            ctypes.POINTER(ctypes.c_float),  # a
            ctypes.POINTER(ctypes.c_float),  # l0

            ctypes.c_int,                    # num_triangles
            ctypes.POINTER(ctypes.c_int),    # indices
            ctypes.POINTER(ctypes.c_float),  # rsi
            ctypes.POINTER(ctypes.c_float),  # mu
            ctypes.POINTER(ctypes.c_float),  # lambda

            ctypes.c_float,                  # k_friction
            ctypes.c_float                   # k_collision
        ]

    @staticmethod
    def load(filename):
        if not os.path.exists(filename):
            raise FileNotFoundError(filename)
        lib = ctypes.cdll.LoadLibrary(filename)
        return NativeInstance(lib)