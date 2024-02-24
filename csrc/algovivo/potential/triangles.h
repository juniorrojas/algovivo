#pragma once
#include "../vec2.h"
#include "../mat2x2.h"

namespace algovivo {

__attribute__((always_inline))
void accumulate_triangle_energy(
  float &energy,
  const float* pos,
  int ia, int ib, int ic,
  float rsi00, float rsi01,
  float rsi10, float rsi11
) {
  vec2_get(a, pos, ia);
  vec2_get(b, pos, ib);
  vec2_get(c, pos, ic);

  vec2_sub(ab, b, a);
  vec2_sub(ac, c, a);

  mat2x2_mm(
    F00, F01,
    F10, F11,
    
    abx, acx,
    aby, acy,
    
    rsi00, rsi01,
    rsi10, rsi11
  );

  float I1 = F00 * F00 + F01 * F01 + F10 * F10 + F11 * F11;
  float J = F00 * F11 - F01 * F10;

  float mu = 500;
  float lambda = 50;
  float qlogJ = -1.5 + 2 * J - 0.5 * J * J;
  float psi_mu = 0.5 * mu * (I1 - 2) - mu * qlogJ;
  float psi_lambda = 0.5 * lambda * qlogJ * qlogJ;
  
  energy += psi_mu + psi_lambda;
}

extern "C"
void rsi_of_pos(
  int num_vertices,
  const float* pos,
  int num_triangles,
  const int* indices,
  float* rsi
) {
  for (int i = 0; i < num_triangles; i++) {
    const auto offset = 3 * i;
    const auto ia = indices[offset    ];
    const auto ib = indices[offset + 1];
    const auto ic = indices[offset + 2];

    vec2_get(a, pos, ia);
    vec2_get(b, pos, ib);
    vec2_get(c, pos, ic);
    
    vec2_sub(ab, b, a);
    vec2_sub(ac, c, a);
    
    const auto rs00 = abx;
    const auto rs01 = acx;
    const auto rs10 = aby;
    const auto rs11 = acy;

    mat2x2_inv(rsi, rs);

    const auto offset_rsi = i * 4;
    rsi[offset_rsi    ] = rsi00;
    rsi[offset_rsi + 1] = rsi01;
    rsi[offset_rsi + 2] = rsi10;
    rsi[offset_rsi + 3] = rsi11;
  }
}

}