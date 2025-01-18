import codegen

class BackwardEuler:
    def __init__(self):
        self.loss = codegen.Fun("backward_euler_loss")

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
        self.add_muscles()
        self.add_triangles()
        self.add_vertex_energy()

        self.loss_body += "return 0.5 * inertial_energy + h * h * potential_energy;"

        self.loss_body = codegen.indent(self.loss_body)

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
        args.add_arg("float", "mu")
        args.add_arg("float", "lambda")

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

    def add_muscles(self):
        self.loss_body += """
for (int i = 0; i < num_muscles; i++) {
  const auto offset = i * 2;
  const auto i1 = muscles[offset    ];
  const auto i2 = muscles[offset + 1];

  accumulate_muscle_energy(
    potential_energy,
    pos,
    i1, i2,
    a[i], l0[i], k
  );
}"""

    def add_triangles(self):
        from neohookean import Neohookean
        neohookean = Neohookean(
            simplex_order=3,
            simplex_name_singular="triangle"
        )
        self.loss_body += "\n" + neohookean.codegen_accumulate_simplices_energy()

    def add_vertex_energy(self):
        # gravity
        self.loss_body += """
for (int i = 0; i < num_vertices; i++) {
  const auto offset = space_dim * i;

  const auto px = pos[offset    ];
  const auto py = pos[offset + 1];

  accumulate_gravity_energy(
    potential_energy,
    py,
    vertex_mass,
    g
  );
}
"""
        # collision
        self.loss_body += """
for (int i = 0; i < num_vertices; i++) {
  const auto offset = space_dim * i;
  const auto py = pos[offset + 1];

  accumulate_collision_energy(
    potential_energy,
    py
  );
}
"""
        # friction
        self.loss_body += """
for (int i = 0; i < num_vertices; i++) {
  const auto offset = space_dim * i;

  const auto px = pos[offset    ];
  const auto py = pos[offset + 1];

  const auto p0x = pos0[offset    ];
  const auto p0y = pos0[offset + 1];

  accumulate_friction_energy(
    potential_energy,
    px,
    p0x, p0y,
    h,
    k_friction
  );
}
"""