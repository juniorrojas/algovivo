#pragma once

namespace mmgrten {

extern "C"
int flatten_idx(
  int order,
  const int* idx,
  const int* stride
) {
  int flat_idx = 0;
  for (int i = 0; i < order; i++) {
    flat_idx += stride[i] * idx[i];
  }
  return flat_idx;
}

extern "C"
float get_tensor_elem(
  int order,
  const int* stride,
  const float* data,
  const int* idx
) {
  int flat_idx = flatten_idx(order, idx, stride);
  return data[flat_idx];
}

extern "C"
void set_tensor_elem(
  int order,
  const int* stride,
  float* data,
  const int* idx,
  float value
) {
  int flat_idx = flatten_idx(order, idx, stride);
  data[flat_idx] = value;
}

extern "C"
void zero_(int n, float* data) {
  for (int i = 0; i < n; i++) {
    data[i] = 0.0;
  }
}

}