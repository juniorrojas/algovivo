#pragma once

extern "C" void
copy_(int n, const float* src, float* dst) {
  for (int i = 0; i < n; i++) dst[i] = src[i];
}

extern "C" void
// dst = a + b * c
addmuls_(int n, const float* a, const float* b, const float c, float* dst) {
  for (int i = 0; i < n; i++) dst[i] = a[i] + b[i] * c;
}

extern "C" void
scale_(int n, float* a, float c) {
  for (int i = 0; i < n; i++) a[i] *= c;
}