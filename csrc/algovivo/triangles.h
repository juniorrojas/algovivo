#pragma once
#include "vec2.h"

namespace algovivo {

extern "C"
void rsi_of_x(
  int num_vertices,
  const float* x,
  int num_triangles,
  const int* indices,
  float* rsi
) {
  for (int i = 0; i < num_triangles; i++) {
    const auto offset = 3 * i;
    const auto ia = indices[offset    ];
    const auto ib = indices[offset + 1];
    const auto ic = indices[offset + 2];

    vec2_get(a, x, ia);
    vec2_get(b, x, ib);
    vec2_get(c, x, ic);
    
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

}