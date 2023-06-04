#pragma once

namespace algovivo {

__attribute__((always_inline))
void accumulate_inertial_energy(
  float &inertial_energy,
  float px, float py,
  float vx, float vy,
  float p0x, float p0y,
  float h,
  float m
) {
  float yx = p0x + h * vx;
  float yy = p0y + h * vy;
  float dx = px - yx;
  float dy = py - yy;
  float d = (dx * dx + dy * dy) * m;
  inertial_energy += d;
}

}