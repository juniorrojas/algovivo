#pragma once

#include "../arr.h"

#include "../vec2.h"

#include "../dynamics/inertia.h"
#include "../potential/friction.h"
#include "../potential/collision.h"
#include "../potential/gravity.h"

#include "optim.h"

namespace algovivo {

float backward_euler_loss(
  // {{backward_euler_loss_args}}
) {
// {{backward_euler_loss_body}}
}

static void backward_euler_loss_grad(
  // {{backward_euler_loss_grad_args}}
) {
// {{backward_euler_loss_grad_body}}
}

void backward_euler_update_pos(
  /* {{backward_euler_update_pos_args}} */
) {
  const auto space_dim = 2; \
  _optim_init();
  const auto max_optim_iters = 100;
  for (int i = 0; i < max_optim_iters; i++) {
    loss_backward();
    break_if_optim_converged();
    optim_step();
  }
}

extern "C"
void backward_euler_update_vel(
  /* {{backward_euler_update_vel_args}} */
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

extern "C"
void backward_euler_update(
  /* {{backward_euler_update_args}} */
) {
  const auto space_dim = 2;
  backward_euler_update_pos(/* {{backward_euler_update_pos_args_call}} */);
  backward_euler_update_vel(/* {{backward_euler_update_vel_args_call}} */);
}

}