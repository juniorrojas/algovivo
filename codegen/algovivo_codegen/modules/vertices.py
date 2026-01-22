class Vertices:
    def __init__(self):
        pass

    def add_args(self, args):
        args.add_arg("int", "num_vertices")
        args.add_arg("float*", "pos0")
        args.add_arg("float*", "vel0")
        args.add_arg("float", "vertex_mass")

    def add_differentiable_args(self, args):
        args.add_arg("float*", "pos", differentiable=True, size="num_vertices * space_dim", convergence_stride="space_dim")

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

    def add_update_pos_args(self, update_pos_args):
        update_pos_args.add_arg("float*", "pos", mut=True)
        update_pos_args.add_arg("float*", "pos_grad", mut=True)
        update_pos_args.add_arg("float*", "pos_tmp", mut=True)
        update_pos_args.add_arg("int*", "fixed_vertex_id")

    def add_update_vel_args(self, update_vel_args):
        update_vel_args.add_arg("int", "num_vertices")
        update_vel_args.add_arg("int", "space_dim")
        update_vel_args.add_arg("float*", "pos0")
        update_vel_args.add_arg("float*", "vel0")
        update_vel_args.add_arg("float*", "pos1", mut=True)
        update_vel_args.add_arg("float*", "vel1", mut=True)
        update_vel_args.add_arg("float", "h")

    def add_optim_init_args(self, args):
        args.add_arg("int", "space_dim")
        args.add_arg("float", "h")
        args.add_arg("int", "num_vertices")
        args.add_arg("float*", "pos0")
        args.add_arg("float*", "vel0")
        args.add_arg("float*", "pos", mut=True)

    def get_inertia_src(self):
        return """for (int i = 0; i < num_vertices; i++) {
  accumulate_inertial_energy(
    inertial_energy,
    i,
    pos,
    vel0,
    pos0,
    h,
    vertex_mass,
    space_dim
  );
}"""

    def get_optim_init_src(self):
        return """for (int i = 0; i < num_vertices; i++) { \\
    const auto offset = i * space_dim; \\
    for (int j = 0; j < space_dim; j++) { \\
      pos[offset + j] = pos0[offset + j] + h * vel0[offset + j]; \\
    } \\
  }"""

    def get_update_vel_src(self):
        return """// vel1 = (pos1 - pos0) / h
  add_scaled(num_vertices * space_dim, pos1, pos0, -1.0, vel1);
  scale_(num_vertices * space_dim, vel1, 1 / h);"""