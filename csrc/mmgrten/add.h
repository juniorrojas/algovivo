#pragma once

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