#pragma once

#include "../dim.h"

namespace algovivo {

__attribute__((always_inline))
void accumulate_friction_energy(
  float &energy,
  const float* pos,
  const float* pos0,
  int i,
  float h,
  float k_friction
) {
  const float eps = 1e-2;
  const auto offset = space_dim * i;
  const auto height = pos0[offset + 1] - eps;
  if (height < 0) {
    const auto vx = (pos[offset] - pos0[offset]) / h;
    energy += k_friction * vx * vx * -height;
  }
}

}
