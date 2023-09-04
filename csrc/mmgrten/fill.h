#pragma once
#include "tensor.h"

namespace mmgrten {

extern "C"
void fill_(
  int n,
  float* data,
  float value
) {
  for (int i = 0; i < n; i++) {
    data[i] = value;
  }
}

}