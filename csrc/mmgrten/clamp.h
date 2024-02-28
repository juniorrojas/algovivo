#pragma once
#include "tensor.h"

namespace mmgrten {

extern "C"
void clamp(
  int n,
  const float* a_data,
  float* b_data,
  float min, float max,
  bool use_min, bool use_max
) {
  for (int i = 0; i < n; i++) {
    auto ai = a_data[i];
    float bi;
    if (use_min && ai < min) bi = min;
    else if (use_max && ai > max) bi = max;
    else bi = ai;
    b_data[i] = bi;
  }
}

}