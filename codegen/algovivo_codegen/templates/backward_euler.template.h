#pragma once

#include "../arr.h"

#include "../vec2.h"

#include "../dynamics/inertia.h"

#include "../potentials/muscles.h"
#include "../potentials/triangles.h"
#include "../potentials/friction.h"
#include "../potentials/collision.h"
#include "../potentials/gravity.h"

#include "optim.h"

// {{includes}}

namespace algovivo {

// {{energy_functions}}

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
  /* {{backward_euler_update_pos_body}} */
}

extern "C"
void optim_init(
  /* {{optim_init_args}} */
) {
  /* {{optim_init_body_fn}} */
}

extern "C"
void backward_euler_update_vel(
  /* {{backward_euler_update_vel_args}} */
) {
  /* {{backward_euler_update_vel_body}} */
}

extern "C"
void backward_euler_update(
  /* {{backward_euler_update_args}} */
) {
  backward_euler_update_pos(/* {{backward_euler_update_pos_args_call}} */);
  backward_euler_update_vel(/* {{backward_euler_update_vel_args_call}} */);
}

}