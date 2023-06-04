#pragma once

__attribute__((always_inline))
void accumulate_friction_energy(
  float &energy,
  float px,
  float p0x, float p0y,
  float h
) {
  float k_friction = 300.0;
  float friction_eps = 1e-2;
  float x0i1 = p0y;
  float interp = x0i1 - friction_eps;    
  if (interp < 0) {
    float xi0 = px;
    float x0i0 = p0x;
    float vix = (xi0 - x0i0) / h;
    energy += k_friction * vix * vix * -interp;
  }
}