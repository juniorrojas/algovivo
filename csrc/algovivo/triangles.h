#pragma once
#include "vec2.h"

namespace algovivo {

extern "C"
void rsi_of_x(
  int num_vertices,
  const float* x,
  int num_triangles,
  const int* indices,
  float* rsi
) {
  for (int i = 0; i < num_triangles; i++) {
    const auto offset = 3 * i;
    const auto ia = indices[offset    ];
    const auto ib = indices[offset + 1];
    const auto ic = indices[offset + 2];

    vec2_get(a, x, ia);
    vec2_get(b, x, ib);
    vec2_get(c, x, ic);
    
    vec2_sub(ab, b, a);
    vec2_sub(ac, c, a);

    const auto d = abx * acy - acx * aby;
    const auto offset_rsi = i * 4;
    rsi[offset_rsi    ] =  acy / d;
    rsi[offset_rsi + 1] = -acx / d;
    rsi[offset_rsi + 2] = -aby / d;
    rsi[offset_rsi + 3] =  abx / d;
  }
}

__attribute__((always_inline))
void accumulate_triangle_energy(
  float &energy,
  const float* x,
  int ia, int ib, int ic,
  float rsi00, float rsi01,
  float rsi10, float rsi11
) {
  vec2_get(a, x, ia);
  vec2_get(b, x, ib);
  vec2_get(c, x, ic);

  vec2_sub(ab, b, a);
  vec2_sub(ac, c, a);

  float sm00 = abx;
  float sm10 = aby;
  float sm01 = acx;
  float sm11 = acy;

  float F00 = sm00 * rsi00 + sm01 * rsi10;
  float F01 = sm00 * rsi01 + sm01 * rsi11;
  float F10 = sm10 * rsi00 + sm11 * rsi10;
  float F11 = sm10 * rsi01 + sm11 * rsi11;

  float I1 = F00 * F00 + F01 * F01 + F10 * F10 + F11 * F11;
  float J = F00 * F11 - F01 * F10;

  float mu = 500;
  float lambda = 50;
  float qlogJ = -1.5 + 2 * J - 0.5 * J * J;
  float psi_mu = 0.5 * mu * (I1 - 2) - mu * qlogJ;
  float psi_lambda = 0.5 * lambda * qlogJ * qlogJ;
  
  energy += psi_mu + psi_lambda;
}

}