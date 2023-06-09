#pragma once

#include "vec2.h"

namespace algovivo {

extern "C"
void l0_of_x(
  int num_vertices,
  const float* x,
  int num_springs,
  const int* indices,
  float* l0
) {
  for (int i = 0; i < num_springs; i++) {
    const auto offset = 2 * i;
    const auto i1 = indices[offset    ];
    const auto i2 = indices[offset + 1];
    
    vec2_get(p1, x, i1);
    vec2_get(p2, x, i2);

    vec2_sub(d, p1, p2);
    const auto q = dx * dx + dy * dy;
    l0[i] = __builtin_sqrt(q);
  }
}

__attribute__((always_inline))
void accumulate_spring_energy(
  float &energy,
  const float* x,
  int i1, int i2,
  float a, float l0
) {
  vec2_get(p1, x, i1);
  vec2_get(p2, x, i2);

  vec2_sub(d, p1, p2);
  const auto q = dx * dx + dy * dy;
  const float l = __builtin_sqrt(q + 1e-6);
  const auto al0 = a * l0;
  const auto dl = (l - al0) / al0;
  const auto k = 90.0;
  energy += 0.5 * k * dl * dl;
}

}