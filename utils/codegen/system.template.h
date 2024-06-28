#pragma once

#include "vec2.h"
#include "dynamics/inertia.h"
#include "potential/friction.h"
#include "potential/collision.h"
#include "potential/gravity.h"

namespace algovivo {

static float backward_euler_loss(
  // {{backward_euler_loss_args}}
) {
// {{backward_euler_loss_body}}
}

static void backward_euler_loss_grad(
  // {{backward_euler_loss_grad_args}}
) {
// {{backward_euler_loss_grad_body}}
}

struct System {
// {{system_attrs}}

  float forward(float* pos) {
    return backward_euler_loss(
      // {{backward_euler_loss_args_call}}
    );
  }

  void backward(float* pos, float* pos_grad) {
    backward_euler_loss_grad(
      // {{backward_euler_loss_grad_args_call}}
    );
  }
};

extern "C"
void backward_euler_update(
// {{backward_euler_update_args}}
) {
  algovivo::System system;

// {{system_set}}

  algovivo::backward_euler_update(
    system,
    pos1, vel1,
    pos_grad, pos_tmp
  );
}

}