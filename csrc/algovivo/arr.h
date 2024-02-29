#pragma once

namespace algovivo {

void zero_(int n, float* data) {
  for (int i = 0; i < n; i++) data[i] = 0.0;
}

void copy_(int n, const float* src, float* dst) {
  for (int i = 0; i < n; i++) dst[i] = src[i];
}

// d = a + b * c
void add_scaled(int n, const float* a, const float* b, const float c, float* d) {
  for (int i = 0; i < n; i++) d[i] = a[i] + b[i] * c;
}

void scale_(int n, float* a, float c) {
  for (int i = 0; i < n; i++) a[i] *= c;
}

}