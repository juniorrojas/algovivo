#pragma once

namespace algovivo {

__attribute__((always_inline))
void accumulate_friction_energy(
  float &energy,
  float px,
  float p0x, float p0y,
  float h
) {
  const float k_friction = 300.0;
  const float eps = 1e-2;
  const auto height = p0y - eps;
  if (height < 0) {
    const auto vx = (px - p0x) / h;
    energy += k_friction * vx * vx * -height;
  }
}

}