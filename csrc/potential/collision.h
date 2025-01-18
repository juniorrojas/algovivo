#pragma once

namespace algovivo {

__attribute__((always_inline))
void accumulate_collision_energy(
  float &energy,
  float py
) {
  const float k_collision = 14000.0;
  if (py < 0) {
    energy += k_collision * py * py;
  }
}

}