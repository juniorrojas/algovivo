#pragma once

extern "C"
void l0_of_x(int num_vertices, const float* x, int num_springs, const int* indices, float* l0) {
  const int space_dim = 2;

  for (int i = 0; i < num_springs; i++) {
    const int offset = 2 * i;
    int i1 = indices[offset    ];
    int i2 = indices[offset + 1];
    
    auto p1x = x[i1 * space_dim    ];
    auto p1y = x[i1 * space_dim + 1];

    auto p2x = x[i2 * space_dim    ];
    auto p2y = x[i2 * space_dim + 1];

    auto dx = p1x - p2x;
    auto dy = p1y - p2y;
    auto q = dx * dx + dy * dy;
    l0[i] = __builtin_sqrt(q);
  }
}