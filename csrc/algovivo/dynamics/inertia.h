#pragma once

namespace algovivo {

__attribute__((always_inline))
void accumulate_inertial_energy(
  float &energy,
  float px, float py,
  float vx, float vy,
  float p0x, float p0y,
  float h,
  float m
) {
  const auto yx = p0x + h * vx;
  const auto yy = p0y + h * vy;
  const auto dx = px - yx;
  const auto dy = py - yy;
  const auto d = (dx * dx + dy * dy) * m;
  energy += d;
}

}