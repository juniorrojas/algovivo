#pragma once

#define vec2_sub(a, b, c) \
  const auto (c##x) = (a##x) - (b##x); \
  const auto (c##y) = (a##y) - (b##y);


extern "C"
void rsi_of_x(int num_vertices, const float* x, int num_triangles, const int* indices, float* rsi) {
  for (int i = 0; i < num_triangles; i++) {
    const auto offset = 3 * i;
    const auto ia = indices[offset    ];
    const auto ib = indices[offset + 1];
    const auto ic = indices[offset + 2];

    // get_vertex_2d(x, ia, a);
    const auto ax = x[2 * ia   ];
    const auto ay = x[2 * ia + 1];

    // get_vertex_2d(x, ib, b);
    const auto bx = x[2 * ib   ];
    const auto by = x[2 * ib + 1];

    // get_vertex_2d(x, ic, c);
    const auto cx = x[2 * ic   ];
    const auto cy = x[2 * ic + 1];
    
    vec2_sub(b, a, ab);
    vec2_sub(c, a, ac);

    const auto d = abx * acy - acx * aby;
    const auto offset_rsi = i * 4;
    rsi[offset_rsi    ] =  acy / d;
    rsi[offset_rsi + 1] = -acx / d;
    rsi[offset_rsi + 2] = -aby / d;
    rsi[offset_rsi + 3] =  abx / d;
  }
}