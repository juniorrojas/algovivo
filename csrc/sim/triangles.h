#pragma once

extern "C"
void rsi_of_x(int num_vertices, const float* x, int num_triangles, const int* indices, float* rsi) {
  const auto space_dim = 2;

  for (int i = 0; i < num_triangles; i++) {
    const auto offset = 2 * i;
    const auto i1 = indices[offset    ];
    const auto i2 = indices[offset + 1];
    const auto i3 = indices[offset + 2];
    
    // const auto p1x = x[i1 * space_dim    ];
    // const auto p1y = x[i1 * space_dim + 1];

    // const auto p2x = x[i2 * space_dim    ];
    // const auto p2y = x[i2 * space_dim + 1];
  }
}