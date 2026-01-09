from .. import Fun

class Collision:
    def __init__(self):
        pass

    def get_src(self):
        return """
for (int i = 0; i < num_vertices; i++) {
  const auto offset = space_dim * i;
  const auto py = pos[offset + 1];

  accumulate_collision_energy(
    potential_energy,
    py,
    k_collision
  );
}
"""

    def make_energy_fn(self, name="collision_energy"):
        f = Fun(name)
        f.args.add_arg("int", "space_dim")
        f.args.add_arg("float", "k_collision")
        f.args.add_arg("int", "num_vertices")
        f.args.add_arg("float*", "pos")
        f.src_body = "float potential_energy = 0.0;" + self.get_src() + "return potential_energy;"
        return f

    def add_to_loss(self, be):
        be.loss_body += self.get_src()