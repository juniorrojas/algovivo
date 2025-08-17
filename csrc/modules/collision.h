#pragma once

namespace algovivo {

__attribute__((always_inline))
void accumulate_collision_energy(
  float &energy,
  float py,
  float k_collision
) {
  if (py < 0) {
    energy += k_collision * py * py;
  }
}

}