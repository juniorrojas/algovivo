#pragma once

#include "../dim.h"

namespace algovivo {

__attribute__((always_inline))
void accumulate_inertial_energy(
  float &energy,
  int i,
  const float* pos,
  const float* vel0,
  const float* pos0,
  const float h,
  float m
) {
  const auto offset = space_dim * i;
  float dy2 = 0;
  for (int j = 0; j < space_dim; j++) {
    const auto p0j = pos0[offset + j];
    const auto v0j = vel0[offset + j];
    const auto yj = p0j + h * v0j;
    const auto pj = pos[offset + j];
    const auto dj = pj - yj;
    dy2 += dj * dj;
  }
  energy += m * dy2;
}

}
