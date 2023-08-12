#pragma once
#include "tensor.h"

extern "C"
void clamp(
  int n,
  const float* a_data,
  float* b_data,
  float min, float max,
  bool useMin, bool useMax
) {
  for (int i = 0; i < n; i++) {
    auto ai = a_data[i];
    float bi;
    if (useMin && ai < min) bi = min;
    else if (useMax && ai > max) bi = max;
    else bi = ai;
    b_data[i] = bi;
  }
}