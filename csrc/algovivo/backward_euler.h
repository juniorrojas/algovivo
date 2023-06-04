#pragma once

#include "arr.h"
#include "vec2.h"
#include "vertices.h"
#include "inertia.h"
#include "friction.h"
#include "collision.h"
#include "gravity.h"
#include "framenorm.h"
#include "enzyme.h"

namespace algovivo {

extern "C"
float backward_euler_loss(
  int num_vertices,
  const float* x,
  const float* x0, const float* v0,
  
  float h,
  const float* r,

  int num_springs,
  const int* springs,

  int num_triangles,
  const int* triangles,
  const float* rsi,

  const float* a,
  const float* l0
) {
  const auto space_dim = 2;

  float inertial_energy = 0.0;
  float potential_energy = 0.0;

  const float vertex_mass = 6.0714287757873535;

  for (int i = 0; i < num_vertices; i++) {
    vertex_loop_context(i, space_dim, x0, x, v0);
    accumulate_inertial_energy(
      inertial_energy,
      px, py,
      vx, vy,
      p0x, p0y,
      h,
      vertex_mass
    );
  }

  for (int i = 0; i < num_springs; i++) {
    const auto offset = i * 2;
    const auto i1 = springs[offset    ];
    const auto i2 = springs[offset + 1];

    accumulate_spring_energy(
      potential_energy,
      x,
      i1, i2,
      a[i], l0[i]
    );
  }

  for (int i = 0; i < num_triangles; i++) {
    const auto offset = i * 3;
    const auto i1 = triangles[offset    ];
    const auto i2 = triangles[offset + 1];
    const auto i3 = triangles[offset + 2];

    const auto rsi_offset = 4 * i;
    float rsi00 = rsi[rsi_offset    ];
    float rsi01 = rsi[rsi_offset + 1];
    float rsi10 = rsi[rsi_offset + 2];
    float rsi11 = rsi[rsi_offset + 3];

    accumulate_triangle_energy(
      potential_energy,
      x,
      i1, i2, i3,
      rsi00, rsi01,
      rsi10, rsi11
    );
  }

  for (int i = 0; i < num_vertices; i++) {
    const auto offset = space_dim * i;
    
    const auto px = x[offset    ];
    const auto py = x[offset + 1];

    const auto p0x = x0[offset    ];
    const auto p0y = x0[offset + 1];

    accumulate_gravity_energy(
      potential_energy,
      py,
      vertex_mass
    );

    accumulate_collision_energy(
      potential_energy,
      py
    );

    accumulate_friction_energy(
      potential_energy,
      px,
      p0x, p0y,
      h
    );
  }

  return 0.5 * inertial_energy + h * h * potential_energy;
}

extern "C"
void backward_euler_loss_grad(
  int num_vertices,
  float* x, float* x_grad,
  float* x0,
  float* v0, float h,
  float* r,

  int num_springs,
  int* springs,

  int num_triangles,
  int* triangles,
  float* rsi,

  float* a,
  float* l0
) {
  __enzyme_autodiff(
    backward_euler_loss,
    enzyme_const, num_vertices,
    enzyme_dup, x, x_grad,
    enzyme_const, x0,
    enzyme_const, v0,
    enzyme_const, h,
    enzyme_const, r,

    enzyme_const, num_springs,
    enzyme_const, springs,

    enzyme_const, num_triangles,
    enzyme_const, triangles,
    enzyme_const, rsi,

    enzyme_const, a,
    enzyme_const, l0
  );
}

struct System {
  int num_vertices;

  float h;

  float* x0;
  float* v0;
  float* r;

  int num_springs;
  int* springs;

  int num_triangles;
  int* triangles;
  float* rsi;

  float* a;
  float* l0;

  int fixed_vertex_id;

  float forward(float* x) {
    return backward_euler_loss(
      num_vertices, x,
      x0, v0, h, r,
      num_springs, springs,
      num_triangles,
      triangles,
      rsi,
      a, l0
    );
  }

  void backward(float* x, float* x_grad) {
    backward_euler_loss_grad(
      num_vertices, x,
      x_grad, x0, v0, h, r,
      num_springs, springs,
      num_triangles, triangles, rsi,
      a, l0
    );
  }
};

void backward_euler_update_x(
  System system,
  float* x,
  float* x_grad, float* x_tmp
) {
  auto const space_dim = 2;
  auto const num_vertices = system.num_vertices;
  auto const x0 = system.x0;
  auto const v = system.v0;
  auto const fixed_vertex_id = system.fixed_vertex_id;
  auto const h = system.h;

  for (int i = 0; i < num_vertices; i++) {
    int offset = i * space_dim;
    x[offset    ] = x0[offset    ] + h * v[offset    ];
    x[offset + 1] = x0[offset + 1] + h * v[offset + 1];
  }

  int max_optim_iters = 100;
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
      float px = x_grad[offset];
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
  auto const space_dim = 2;
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

void backward_euler_update(
  System system,
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