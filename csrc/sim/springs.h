#pragma once

extern "C"
void l0_of_x(int num_vertices, const float* x, int num_springs, const int* indices, float* l0) {
  const auto space_dim = 2;

  for (int i = 0; i < num_springs; i++) {
    const auto offset = 2 * i;
    const auto i1 = indices[offset    ];
    const auto i2 = indices[offset + 1];
    
    const auto p1x = x[i1 * space_dim    ];
    const auto p1y = x[i1 * space_dim + 1];

    const auto p2x = x[i2 * space_dim    ];
    const auto p2y = x[i2 * space_dim + 1];

    const auto dx = p1x - p2x;
    const auto dy = p1y - p2y;
    const auto q = dx * dx + dy * dy;
    l0[i] = __builtin_sqrt(q);
  }
}