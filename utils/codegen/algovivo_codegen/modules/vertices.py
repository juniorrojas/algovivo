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

    def add_update_vel_args(self, update_vel_args):
        update_vel_args.add_arg("int", "num_vertices")
        update_vel_args.add_arg("int", "space_dim")
        update_vel_args.add_arg("float*", "pos0")
        update_vel_args.add_arg("float*", "vel0")
        update_vel_args.add_arg("float*", "pos1", mut=True)
        update_vel_args.add_arg("float*", "vel1", mut=True)
        update_vel_args.add_arg("float", "h")