#pragma once

namespace algovivo {

__attribute__((always_inline))
void accumulate_gravity_energy(
  float &energy,
  float py,
  float m,
  float g
) {
  energy += py * m * g;
}

}