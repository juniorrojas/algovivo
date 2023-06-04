#pragma once

void copy_(int n, const float* src, float* dst) {
  for (int i = 0; i < n; i++) dst[i] = src[i];
}

// dst = a + b * c
void addmuls_(int n, const float* a, const float* b, const float c, float* dst) {
  for (int i = 0; i < n; i++) dst[i] = a[i] + b[i] * c;
}

void scale_(int n, float* a, float c) {
  for (int i = 0; i < n; i++) a[i] *= c;
}