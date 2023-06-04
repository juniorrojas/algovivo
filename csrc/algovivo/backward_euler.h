#pragma once

#include "arr.h"
#include "vec2.h"
#include "inertia.h"
#include "friction.h"
#include "collision.h"
#include "gravity.h"
#include "framenorm.h"
#include "enzyme.h"

namespace algovivo {

template <typename T>
void backward_euler_update_x(
  T system,
  float* x,
  float* x_grad, float* x_tmp
) {
  const auto space_dim = 2;
  const auto num_vertices = system.num_vertices;
  const auto x0 = system.x0;
  const auto v = system.v0;
  const auto fixed_vertex_id = system.fixed_vertex_id;
  const auto h = system.h;

  for (int i = 0; i < num_vertices; i++) {
    const auto offset = i * space_dim;
    x[offset    ] = x0[offset    ] + h * v[offset    ];
    x[offset + 1] = x0[offset + 1] + h * v[offset + 1];
  }

  const auto max_optim_iters = 100;
  for (int i = 0; i < max_optim_iters; i++) {
    zero_(num_vertices * space_dim, x_grad);
    system.backward(x, x_grad);

    if (fixed_vertex_id > -1) {
      x_grad[fixed_vertex_id * space_dim    ] = 0.0;
      x_grad[fixed_vertex_id * space_dim + 1] = 0.0;
    }
    
    float grad_max_q = 0.0;
    float grad_q_tol = 0.5 * 1e-5;
    for (int k = 0; k < num_vertices; k++) {
      int offset = k * space_dim;
      float px = x_grad[offset    ];
      float py = x_grad[offset + 1];
      float q = px * px + py * py;
      if (q > grad_max_q) grad_max_q = q;
    }
    if (grad_max_q < grad_q_tol) break;

    float step_size = 1.0;
    int max_line_search_iters = 20;
    float backtracking_scale = 0.3;

    float loss0 = system.forward(x);

    for (int i = 0; i < max_line_search_iters; i++) {
      addmuls_(num_vertices * space_dim, x, x_grad, -step_size, x_tmp);
      float loss1 = system.forward(x_tmp);
      if (loss1 < loss0) {
        break;
      } else {
        step_size *= backtracking_scale;
      }
    }
    
    addmuls_(num_vertices * space_dim, x, x_grad, -step_size, x);
  }
}

extern "C"
void backward_euler_update_v(
  float num_vertices,
  float* x0, float* v0,
  float* x1, float* v1,
  float h
) {
  const auto space_dim = 2;
  // v = (x1 - x0) / h
  addmuls_(
    num_vertices * space_dim,
    x1, x0,
    -1.0,
    v1
  );
  scale_(
    num_vertices * space_dim,
    v1, 1 / h
  );
}

template <typename T>
void backward_euler_update(
  T system,
  float* x1,
  float* v1,
  float* x_grad, float* x_tmp
) {
  backward_euler_update_x(
    system,
    x1,
    x_grad, x_tmp
  );
  backward_euler_update_v(
    system.num_vertices,
    system.x0,
    system.v0,
    x1, v1,
    system.h
  );
}

}