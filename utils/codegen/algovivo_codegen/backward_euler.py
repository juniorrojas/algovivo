from .codegen import Fun, Args, indent

class BackwardEuler:
    def __init__(self):
        self.loss = Fun("backward_euler_loss")
        self.potentials = []

    def make_loss(self):
        self.loss.args.add_arg("int", "space_dim")
        self.loss.args.add_arg("float", "g")
        self.loss.args.add_arg("float", "h")

        self.add_vertices_args()
        self.add_muscles_args()
        self.add_triangles_args()
        self.add_friction_args()

        self.loss.args.add_arg("float*", "pos", differentiable=True)
        
        self.loss_body = """
float inertial_energy = 0.0;
float potential_energy = 0.0;"""

        self.add_inertia()

        for potential in self.potentials:
            potential.add_to_loss(self)

        self.loss_body += "return 0.5 * inertial_energy + h * h * potential_energy;"

        self.loss_body = indent(self.loss_body)

    def make_update_args(self):
        update_args = Args()
        for arg in self.loss.args:
            if not arg.differentiable:
                update_args.add_arg(arg.t, arg.name)
        update_args.add_arg("int*", "fixed_vertex_id")

        for arg in self.loss.args:
            if arg.differentiable:
                update_args.add_arg(arg.t, f"{arg.name}1", mut=True)
                update_args.add_arg(arg.t, f"{arg.name}_grad", mut=True)
                update_args.add_arg(arg.t, f"{arg.name}_tmp", mut=True)
                if arg.name == "pos":
                    update_args.add_arg(arg.t, f"vel1", mut=True)
                else:
                    update_args.add_arg(arg.t, f"{arg.name}_v1", mut=True)

        return update_args

    def add_vertices_args(self):
        args = self.loss.args
        args.add_arg("int", "num_vertices")
        args.add_arg("float*", "pos0")
        args.add_arg("float*", "vel0")
        args.add_arg("float", "vertex_mass")

    def add_muscles_args(self):
        args = self.loss.args
        args.add_arg("int", "num_muscles")
        args.add_arg("int*", "muscles")
        args.add_arg("float", "k")
        args.add_arg("float*", "a")
        args.add_arg("float*", "l0")

    def add_triangles_args(self):
        args = self.loss.args
        args.add_arg("int", "num_triangles")
        args.add_arg("int*", "triangles")
        args.add_arg("float*", "rsi")
        args.add_arg("float*", "mu")
        args.add_arg("float*", "lambda")

    def add_friction_args(self):
        args = self.loss.args
        args.add_arg("float", "k_friction")

    def add_inertia(self):
        self.loss_body += """
for (int i = 0; i < num_vertices; i++) {
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