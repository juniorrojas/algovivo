#pragma once

#include "arr.h"
#include "vec2.h"
#include "inertia.h"
#include "friction.h"
#include "collision.h"
#include "gravity.h"
#include "frame_projection.h"
#include "enzyme.h"

namespace algovivo {

template <typename T>
void backward_euler_update_pos(
  T system,
  float* x,
  float* x_grad, float* x_tmp
) {
  const auto space_dim = 2;
  const auto num_vertices = system.num_vertices;
  const auto x0 = system.pos0;
  const auto v = system.vel0;
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
      const auto offset = fixed_vertex_id * space_dim;
      x_grad[offset    ] = 0.0;
      x_grad[offset + 1] = 0.0;
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
    const auto max_line_search_iters = 20;
    float backtracking_scale = 0.3;

    const auto loss0 = system.forward(x);

    for (int i = 0; i < max_line_search_iters; i++) {
      addmuls_(num_vertices * space_dim, x, x_grad, -step_size, x_tmp);
      const auto loss1 = system.forward(x_tmp);
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
void backward_euler_update_vel(
  float num_vertices,
  float* pos0, float* vel0,
  float* pos1, float* vel1,
  float h
) {
  const auto space_dim = 2;
  // vel1 = (pos1 - pos0) / h
  addmuls_(
    num_vertices * space_dim,
    pos1, pos0,
    -1.0,
    vel1
  );
  scale_(
    num_vertices * space_dim,
    vel1, 1 / h
  );
}

template <typename T>
void backward_euler_update(
  T system,
  float* pos1,
  float* vel1,
  float* pos_grad, float* pos_tmp
) {
  backward_euler_update_pos(
    system,
    pos1,
    pos_grad, pos_tmp
  );
  backward_euler_update_vel(
    system.num_vertices,
    system.pos0,
    system.vel0,
    pos1, vel1,
    system.h
  );
}

}