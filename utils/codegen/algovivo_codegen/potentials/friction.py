class Friction:
    def __init__(self):
        pass
    
    def add_to_loss(self, be):
        be.loss_body += """
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