#pragma once

extern "C"
void rsi_of_x(int num_vertices, const float* x, int num_triangles, const int* indices, float* rsi) {
  const auto space_dim = 2;

  for (int i = 0; i < num_triangles; i++) {
    const auto offset = 3 * i;
    const auto ia = indices[offset    ];
    const auto ib = indices[offset + 1];
    const auto ic = indices[offset + 2];

    // const auto ax = x[space_dim * ia    ];
    // const auto ay = x[space_dim * ia + 1];

    // const auto bx = x[space_dim * ib    ];
    // const auto by = x[space_dim * ib + 1];

    get_vertex(x, ia, a);
    
    // const auto p1x = x[i1 * space_dim    ];
    // const auto p1y = x[i1 * space_dim + 1];

    // const auto p2x = x[i2 * space_dim    ];
    // const auto p2y = x[i2 * space_dim + 1];
  }
}