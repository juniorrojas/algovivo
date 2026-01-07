#pragma once

#include "../arr.h"

#include "../vec2.h"

#include "../dynamics/inertia.h"

#include "../modules/muscles.h"
#include "../modules/triangles.h"
#include "../modules/friction.h"
#include "../modules/collision.h"
#include "../modules/gravity.h"

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
  backward_euler_update_pos(/* {{backward_euler_update_pos_args_call}} */);
  backward_euler_update_vel(/* {{backward_euler_update_vel_args_call}} */);
}

}