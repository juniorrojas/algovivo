#pragma once
#include "tensor.h"

namespace mmgrten {

extern "C"
void tanh(
  int n,
  float* a_data,
  float* b_data
) {
  // TODO strides
  for (int i = 0; i < n; i++) {
    auto ai = a_data[i];
    // TODO scalar tanh
    auto bi = ai; // tanh(ai);
    b_data[i] = bi;
  }
}

}