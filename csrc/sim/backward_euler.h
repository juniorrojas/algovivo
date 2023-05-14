#pragma once

#include "arr.h"
#include "vertices.h"
#include "inertia.h"
#include "framenorm.h"
#include "enzyme.h"

extern "C"
float backward_euler_loss(
  int num_vertices,
  const float* x,
  const float* x0, const float* v,
  
  float h,
  const float* r,

  int num_springs,
  const int* springs,

  int num_triangles,
  const int* triangles,
  const float* rsi,

  const float* a,
  const float* l0
) {
  const auto space_dim = 2;

  float inertial_energy = 0.0;
  float potential_energy = 0.0;

  float vertex_mass = 6.0714287757873535;

  for (int i = 0; i < num_vertices; i++) {
    vertex_loop_context(i, space_dim, x0, x, v);
    inertial_energy(inertial_energy,
      px, py,
      vx, vy,
      p0x, p0y,
      h,
      vertex_mass
    );
  }

  for (int i = 0; i < num_springs; i++) {
    auto offset = i * 2;
    int i1 = springs[offset    ];
    int i2 = springs[offset + 1];

    int offset_i1 = i1 * space_dim;
    int offset_i2 = i2 * space_dim;

    float se = 0.0;

    float p1x = x[offset_i1];
    float p1y = x[offset_i1 + 1];
    float p2x = x[offset_i2];
    float p2y = x[offset_i2 + 1];

    float dx = p1x - p2x;
    float dy = p1y - p2y;
    float q = dx * dx + dy * dy;

    float l = __builtin_sqrt(q + 1e-6);
    float al0 = a[i] * l0[i];

    float dl = (l - al0) / al0;
    float k = 90.0;
    
    potential_energy += 0.5 * k * dl * dl;
  }

  for (int i = 0; i < num_triangles; i++) {
    auto offset = i * 3;
    int i1 = triangles[offset    ];
    int i2 = triangles[offset + 1];
    int i3 = triangles[offset + 2];

    int offset_i1 = i1 * space_dim;
    int offset_i2 = i2 * space_dim;
    int offset_i3 = i3 * space_dim;
    
    float ax = x[offset_i1];
    float ay = x[offset_i1 + 1];
    float bx = x[offset_i2];
    float by = x[offset_i2 + 1];
    float cx = x[offset_i3];
    float cy = x[offset_i3 + 1];

    float abx = bx - ax;
    float aby = by - ay;
    float acx = cx - ax;
    float acy = cy - ay;

    float sm00 = abx;
    float sm10 = aby;
    float sm01 = acx;
    float sm11 = acy;

    int rsi_offset = 4 * i;
    float rsi00 = rsi[rsi_offset];
    float rsi01 = rsi[rsi_offset + 1];
    float rsi10 = rsi[rsi_offset + 2];
    float rsi11 = rsi[rsi_offset + 3];

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
    
    potential_energy += psi_mu + psi_lambda;
  }

  for (int i = 0; i < num_vertices; i++) {
    int offset = space_dim * i;
    
    float xi0 = x[i * space_dim + 0];
    float xi1 = x[i * space_dim + 1];

    // gravity
    potential_energy += xi1 * vertex_mass * 9.8;
    
    // collision
    float k_collision = 14000.0;
    if (xi1 < 0) {
      float d = xi1;
      potential_energy += k_collision * d * d;
    }

    // friction
    float k_friction = 300.0;
    float friction_eps = 1e-2;
    float x0i1 = x0[offset + 1];
    float interp = x0i1 - friction_eps;    
    if (interp < 0) {
      float xi0 = x[offset];
      float x0i0 = x0[i * space_dim];
      float vix = (xi0 - x0i0) / h;
      potential_energy += k_friction * vix * vix * -interp;
    }
  }

  return 0.5 * inertial_energy + h * h * potential_energy;
}

extern "C"
void backward_euler_loss_grad(
  int num_vertices,
  float* x, float* x_grad,
  float* x0,
  float* v, float h,
  float* r,

  int num_springs,
  int* springs,

  int num_triangles,
  int* triangles,
  float* rsi,

  float* a,
  float* l0
) {
  __enzyme_autodiff(
    backward_euler_loss,
    enzyme_const, num_vertices,
    enzyme_dup, x, x_grad,
    enzyme_const, x0,
    enzyme_const, v,
    enzyme_const, h,
    enzyme_const, r,

    enzyme_const, num_springs,
    enzyme_const, springs,

    enzyme_const, num_triangles,
    enzyme_const, triangles,
    enzyme_const, rsi,

    enzyme_const, a,
    enzyme_const, l0
  );
}

#define eval_loss(x1) backward_euler_loss(num_vertices, x1, x0, v, h, r, num_springs, springs, num_triangles, triangles, rsi, a, l0)

extern "C"
void be_step(
  int num_vertices,
  float* x, float* x_grad, float* x_tmp,
  float* x0,
  float* v, float* v1,
  float h,
  float* r,

  int num_springs,
  int* springs,

  int num_triangles,
  int* triangles,
  float* rsi,

  float* a,
  float* l0,

  int fixed_vertex_id
) {
  int space_dim = 2;

  for (int i = 0; i < num_vertices; i++) {
    int offset = i * space_dim;
    x[offset    ] = x0[offset    ] + h * v[offset    ];
    x[offset + 1] = x0[offset + 1] + h * v[offset + 1];
  }

  int max_optim_iters = 100;
  for (int i = 0; i < max_optim_iters; i++) {
    zero_(num_vertices * space_dim, x_grad);
    backward_euler_loss_grad(
      num_vertices,
      x, x_grad,
      x0,
      v, h,
      r,
      num_springs,
      springs,
      
      num_triangles,
      triangles,
      rsi,

      a,
      l0
    );

    if (fixed_vertex_id > -1) {
      x_grad[fixed_vertex_id * space_dim    ] = 0.0;
      x_grad[fixed_vertex_id * space_dim + 1] = 0.0;
    }
    
    float grad_max_q = 0.0;
    float grad_q_tol = 0.5 * 1e-5;
    for (int k = 0; k < num_vertices; k++) {
      int offset = k * space_dim;
      float px = x_grad[offset];
      float py = x_grad[offset + 1];
      float q = px * px + py * py;
      if (q > grad_max_q) grad_max_q = q;
    }
    if (grad_max_q < grad_q_tol) break;

    float step_size = 1.0;
    int max_line_search_iters = 20;
    float backtracking_scale = 0.3;

    float loss0 = eval_loss(x);

    for (int i = 0; i < max_line_search_iters; i++) {
      addmuls_(num_vertices * space_dim, x, x_grad, -step_size, x_tmp);
      float loss1 = eval_loss(x_tmp);
      if (loss1 < loss0) {
        break;
      } else {
        step_size *= backtracking_scale;
      }
    }
    
    addmuls_(num_vertices * space_dim, x, x_grad, -step_size, x);
  }

  // v = (x - x0) / h
  addmuls_(
    num_vertices * space_dim,
    x, x0,
    -1.0,
    v1
  );
  scale_(
    num_vertices * space_dim,
    v1, 1 / h
  );
}