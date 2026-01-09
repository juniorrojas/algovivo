from .. import Fun

class Friction:
    def __init__(self):
        pass

    def get_src(self):
        return """
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

    def make_energy_fn(self, name="friction_energy"):
        f = Fun(name)
        f.args.add_arg("int", "space_dim")
        f.args.add_arg("float", "h")
        f.args.add_arg("float", "k_friction")
        f.args.add_arg("int", "num_vertices")
        f.args.add_arg("float*", "pos0")
        f.args.add_arg("float*", "pos")
        f.src_body = "float potential_energy = 0.0;" + self.get_src() + "return potential_energy;"
        return f

    def add_to_loss(self, be):
        be.loss_body += self.get_src()