#pragma once

#include "../arr.h"
#include "optim.h"

namespace algovivo {

template <typename T>
void backward_euler_update_pos(
  T system,
  int num_vertices, int space_dim, float* pos, float* pos_grad, float* pos_tmp, int fixed_vertex_id
) {
  const auto pos0 = system.pos0;
  const auto vel = system.vel0;
  const auto h = system.h;

  optim_init();
  const auto max_optim_iters = 100;
  for (int i = 0; i < max_optim_iters; i++) {
    loss_backward();
    break_if_optim_converged();
    optim_step();
  }
}

extern "C"
void backward_euler_update_vel(
  int num_vertices, int space_dim, const float* pos0, const float* vel0, float* pos1, float* vel1, float h
) {
  // vel1 = (pos1 - pos0) / h
  add_scaled(
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
  float* pos1, float* vel1, float* pos_grad, float* pos_tmp
) {
  const auto space_dim = 2;
  backward_euler_update_pos(
    system,
    system.num_vertices,
    space_dim,
    pos1,
    pos_grad, pos_tmp,
    system.fixed_vertex_id
  );
  backward_euler_update_vel(
    system.num_vertices,
    space_dim,
    system.pos0,
    system.vel0,
    pos1, vel1,
    system.h
  );
}

}