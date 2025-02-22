#pragma once
// #include "../system.h"

#define _optim_init() { \
  for (int i = 0; i < num_vertices; i++) { \
    const auto offset = i * space_dim; \
    for (int j = 0; j < space_dim; j++) { \
      pos[offset + j] = pos0[offset + j] + h * vel0[offset + j]; \
    } \
  } \
}

extern "C"
void optim_init(
  int num_vertices, int space_dim,
  float h,
  const float* pos0, const float* vel0,
  float* pos
) {
  _optim_init();
}

#define loss_backward() { \
  zero_(num_vertices * space_dim, pos_grad); \
  backward_euler_loss_grad(space_dim, g, h, num_vertices, pos0, vel0, vertex_mass, num_muscles, muscles, k, a, l0, num_triangles, triangles, rsi, mu, lambda, k_friction, pos, pos_grad); \
  if (fixed_vertex_id != 0) { \
    const auto offset = fixed_vertex_id[0] * space_dim; \
    for (int j = 0; j < space_dim; j++) { \
      pos_grad[offset + j] = 0.0; \
    } \
  } \
}

#define break_if_optim_converged() { \
  if (optim_converged(space_dim, num_vertices, pos_grad)) break; \
}

bool optim_converged(int space_dim, int num_vertices, const float* pos_grad) {
  float grad_max_q = 0.0;
  float grad_q_tol = 0.5 * 1e-5;
  for (int k = 0; k < num_vertices; k++) {
    int offset = k * space_dim;
    float q = 0.0;
    for (int j = 0; j < space_dim; j++) {
      q += pos_grad[offset + j] * pos_grad[offset + j];
    }
    if (q > grad_max_q) grad_max_q = q;
  }
  return grad_max_q < grad_q_tol;
}

#define optim_step() { \
  float step_size = 1.0; \
  const auto max_line_search_iters = 20; \
  float backtracking_scale = 0.3; \
  const auto loss0 = backward_euler_loss(space_dim, g, h, num_vertices, pos0, vel0, vertex_mass, num_muscles, muscles, k, a, l0, num_triangles, triangles, rsi, mu, lambda, k_friction, pos); \
  for (int i = 0; i < max_line_search_iters; i++) { \
    add_scaled(num_vertices * space_dim, pos, pos_grad, -step_size, pos_tmp); \
    const auto loss1 = backward_euler_loss(space_dim, g, h, num_vertices, pos0, vel0, vertex_mass, num_muscles, muscles, k, a, l0, num_triangles, triangles, rsi, mu, lambda, k_friction, pos_tmp); \
    if (loss1 < loss0) { \
      break; \
    } else { \
      step_size *= backtracking_scale; \
    } \
  } \
  add_scaled(num_vertices * space_dim, pos, pos_grad, -step_size, pos); \
}