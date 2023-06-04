#pragma once

namespace algovivo {

__attribute__((always_inline))
void accumulate_friction_energy(
  float &energy,
  float px,
  float p0x, float p0y,
  float h
) {
  float k_friction = 300.0;
  float friction_eps = 1e-2;
  float height = p0y - friction_eps;
  if (height < 0) {
    float vx = (px - p0x) / h;
    energy += k_friction * vx * vx * -height;
  }
}

}