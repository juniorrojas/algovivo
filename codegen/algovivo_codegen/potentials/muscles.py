from .. import Fun

class Muscles:
    def __init__(self):
        pass

    def get_src(self):
        return """
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
}
"""

    def make_energy_fn(self, name="muscle_energy"):
        f = Fun(name)
        f.args.add_arg("float", "k")
        f.args.add_arg("int", "num_muscles")
        f.args.add_arg("int*", "muscles")
        f.args.add_arg("float*", "a")
        f.args.add_arg("float*", "l0")
        f.args.add_arg("float*", "pos", differentiable=True, size="num_vertices * space_dim")
        f.src_body = "float potential_energy = 0.0;" + self.get_src() + "return potential_energy;"
        return f

    def add_to_loss(self, be):
        be.loss_body += self.get_src()
