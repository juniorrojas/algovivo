#pragma once
#include "tensor.h"

namespace mmgrten {

extern "C"
void relu(
  int n,
  const float* a_data,
  float* b_data
) {
  // TODO strides
  for (int i = 0; i < n; i++) {
    const auto ai = a_data[i];
    float bi;
    if (ai < 0) bi = 0; else bi = ai;
    b_data[i] = bi;
  }
}

}