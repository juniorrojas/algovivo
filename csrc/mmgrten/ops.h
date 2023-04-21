#pragma once

extern "C"
void pow2(
  int a_numel,
  float* a_data,
  float* b_data
) {
  for (int i = 0; i < a_numel; i++) {
    auto ai = a_data[i];
    b_data[i] = ai * ai;
  }
}

extern "C"
void add(
  int a_numel,
  float* a_data,
  float* b_data,
  float* c_data
) {
  for (int i = 0; i < a_numel; i++) {
    auto ai = a_data[i];
    auto bi = b_data[i];
    c_data[i] = ai + bi;
  }
}

extern "C"
void sum(
  int a_numel,
  float* a_data,
  float* b_data
) {
  b_data[0] = 0.0;
  for (int i = 0; i < a_numel; i++) {
    b_data[0] += a_data[i];
  }
}
