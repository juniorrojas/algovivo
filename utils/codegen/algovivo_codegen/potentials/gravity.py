class Gravity:
    def __init__(self):
        pass

    def add_to_loss(self, be):
        be.loss_body += """
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