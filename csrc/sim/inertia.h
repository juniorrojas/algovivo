#pragma once

#define inertial_energy(inertial_energy, px, py, vx, vy, p0x, p0y, h, m) {\
  float yx = p0x + h * vx;\
  float yy = p0y + h * vy;\
  float dx = px - yx;\
  float dy = py - yy;\
  float d = (dx * dx + dy * dy) * m;\
  inertial_energy += d;\
}