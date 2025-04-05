class Vertices:
    def __init__(self):
        pass

    def add_args(self, args):
        args.add_arg("int", "num_vertices")
        args.add_arg("float*", "pos0")
        args.add_arg("float*", "vel0")
        args.add_arg("float", "vertex_mass")

    def add_update_args(self, args):
        args.add_arg("int", "num_vertices")
        args.add_arg("float*", "pos0")
        args.add_arg("float*", "vel0")
        args.add_arg("float", "vertex_mass")

        args.add_arg("int*", "fixed_vertex_id")

        inertial_arg_name = "pos"
        inertial_arg_t = "float*"
        args.add_arg(inertial_arg_t, f"{inertial_arg_name}1", mut=True)
        args.add_arg(inertial_arg_t, f"{inertial_arg_name}_grad", mut=True)
        args.add_arg(inertial_arg_t, f"{inertial_arg_name}_tmp", mut=True)
        args.add_arg(inertial_arg_t, f"vel1", mut=True)

class Muscles:
    def __init__(self):
        pass

    def add_args(self, args):
        args.add_arg("int", "num_muscles")
        args.add_arg("int*", "muscles")
        args.add_arg("float", "k")
        args.add_arg("float*", "a")
        args.add_arg("float*", "l0")

    def add_update_args(self, args):
        self.add_args(args)

class Triangles:
    def __init__(self):
        pass

    def add_args(self, args):
        args.add_arg("int", "num_triangles")
        args.add_arg("int*", "triangles")
        args.add_arg("float*", "rsi")
        args.add_arg("float*", "mu")
        args.add_arg("float*", "lambda")

    def add_update_args(self, args):
        self.add_args(args)

class Friction:
    def add_args(self, args):
        args.add_arg("float", "k_friction")

    def add_update_args(self, args):
        self.add_args(args)