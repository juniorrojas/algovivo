#pragma once

#define optim_init() { \
  for (int i = 0; i < num_vertices; i++) { \
    const auto offset = i * space_dim; \
    for (int j = 0; j < space_dim; j++) { \
      pos[offset + j] = pos0[offset + j] + h * vel[offset + j]; \
    } \
  } \
}

#define loss_backward() { \
  zero_(num_vertices * space_dim, pos_grad); \
  system.backward(pos, pos_grad); \
  if (fixed_vertex_id > -1) { \
    const auto offset = fixed_vertex_id * space_dim; \
    pos_grad[offset    ] = 0.0; \
    pos_grad[offset + 1] = 0.0; \
  } \
}

#define break_if_optim_converged() { \
  float grad_max_q = 0.0; \
  float grad_q_tol = 0.5 * 1e-5; \
  for (int k = 0; k < num_vertices; k++) { \
    int offset = k * space_dim; \
    float px = pos_grad[offset    ]; \
    float py = pos_grad[offset + 1]; \
    float q = px * px + py * py; \
    if (q > grad_max_q) grad_max_q = q; \
  } \
  if (grad_max_q < grad_q_tol) break; \
}

#define optim_step() { \
  float step_size = 1.0; \
  const auto max_line_search_iters = 20; \
  float backtracking_scale = 0.3; \
  const auto loss0 = system.forward(pos); \
  for (int i = 0; i < max_line_search_iters; i++) { \
    add_scaled(num_vertices * space_dim, pos, pos_grad, -step_size, pos_tmp); \
    const auto loss1 = system.forward(pos_tmp); \
    if (loss1 < loss0) { \
      break; \
    } else { \
      step_size *= backtracking_scale; \
    } \
  } \
  add_scaled(num_vertices * space_dim, pos, pos_grad, -step_size, pos); \
}