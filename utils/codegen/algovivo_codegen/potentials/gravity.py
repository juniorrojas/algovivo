from .. import Fun

class Gravity:
    def __init__(self):
        pass

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

    def make_loss_fn(self, name):
        f = Fun(name)
        f.args.add_arg("int", "space_dim")
        f.args.add_arg("float", "g")
        f.args.add_arg("int", "num_vertices")
        f.src_body = self.get_src()
        return f

    def add_to_loss(self, be):
        be.loss_body += self.get_src()