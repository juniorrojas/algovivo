from .. import Fun

class Gravity:
    def __init__(self):
        pass

    def add_args(self, args):
        args.add_arg("float", "g")

    def add_update_args(self, args):
        args.add_arg("float", "g")

    def get_src(self):
        return """
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

    def make_energy_fn(self, name="gravity_energy"):
        f = Fun(name)
        f.args.add_arg("int", "space_dim")
        f.args.add_arg("float", "g")
        f.args.add_arg("int", "num_vertices")
        f.args.add_arg("float*", "pos")
        f.args.add_arg("float", "vertex_mass")
        f.src_body = "float potential_energy = 0.0;" + self.get_src() + "return potential_energy;"
        return f

    def add_to_loss(self, be):
        be.loss_body += self.get_src()