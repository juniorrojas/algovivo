#pragma once

#include "../arr.h"
#include "optim.h"

namespace algovivo {

template <typename T>
void backward_euler_update_pos(
  T system,
  float* pos,
  float* pos_grad, float* pos_tmp
) {
  const auto space_dim = 2;
  const auto num_vertices = system.num_vertices;
  const auto pos0 = system.pos0;
  const auto vel = system.vel0;
  const auto fixed_vertex_id = system.fixed_vertex_id;
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
  float num_vertices,
  const float* pos0, const float* vel0,
  float* pos1, float* vel1,
  float h
) {
  const auto space_dim = 2;
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