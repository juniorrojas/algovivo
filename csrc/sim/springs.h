#pragma once

#include "vec2.h"
#include "vertices.h"

extern "C"
void l0_of_x(int num_vertices, const float* x, int num_springs, const int* indices, float* l0) {
  for (int i = 0; i < num_springs; i++) {
    const auto offset = 2 * i;
    const auto i1 = indices[offset    ];
    const auto i2 = indices[offset + 1];
    
    get_vertex_2d(p1, x, i1);
    get_vertex_2d(p2, x, i2);

    vec2_sub(d, p1, p2);
    const auto q = dx * dx + dy * dy;
    l0[i] = __builtin_sqrt(q);
  }
}