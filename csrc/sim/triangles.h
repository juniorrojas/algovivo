#pragma once
#include "vec2.h"

extern "C"
void rsi_of_x(int num_vertices, const float* x, int num_triangles, const int* indices, float* rsi) {
  for (int i = 0; i < num_triangles; i++) {
    const auto offset = 3 * i;
    const auto ia = indices[offset    ];
    const auto ib = indices[offset + 1];
    const auto ic = indices[offset + 2];

    get_vertex_2d(a, x, ia);
    get_vertex_2d(b, x, ib);
    get_vertex_2d(c, x, ic);
    
    vec2_sub(ab, b, a);
    vec2_sub(ac, c, a);

    const auto d = abx * acy - acx * aby;
    const auto offset_rsi = i * 4;
    rsi[offset_rsi    ] =  acy / d;
    rsi[offset_rsi + 1] = -acx / d;
    rsi[offset_rsi + 2] = -aby / d;
    rsi[offset_rsi + 3] =  abx / d;
  }
}