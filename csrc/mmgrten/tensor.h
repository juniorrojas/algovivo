#pragma once

extern "C"
int flatten_idx(
  int order,
  int* idx,
  int* stride
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
  int* stride,
  float* data,
  int* idx
) {
  int flat_idx = flatten_idx(order, idx, stride);
  return data[flat_idx];
}

extern "C"
void set_tensor_elem(
  int order,
  int* stride,
  float* data,
  int* idx,
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