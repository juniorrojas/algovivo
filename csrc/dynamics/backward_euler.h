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
  float g, float h, int num_vertices, const float* pos0, const float* vel0, float vertex_mass, int num_muscles, const int* muscles, float k, const float* a, const float* l0, int num_triangles, const int* triangles, const float* rsi, float mu, float lambda, float k_friction, const float* pos
) {
  const auto space_dim = 2;
  
  float inertial_energy = 0.0;
  float potential_energy = 0.0;
  for (int i = 0; i < num_vertices; i++) {
    vec2_get(p, pos, i);
    vec2_get(v, vel0, i);
    vec2_get(p0, pos0, i);
    accumulate_inertial_energy(
      inertial_energy,
      px, py,
      vx, vy,
      p0x, p0y,
      h,
      vertex_mass
    );
  }
  for (int i = 0; i < num_muscles; i++) {
    const auto offset = i * 2;
    const auto i1 = muscles[offset    ];
    const auto i2 = muscles[offset + 1];
  
    accumulate_muscle_energy(
      potential_energy,
      pos,
      i1, i2,
      a[i], l0[i], k
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
      pos,
      i1, i2, i3,
      rsi00, rsi01,
      rsi10, rsi11,
      1,
      mu, lambda
    );
  }
  for (int i = 0; i < num_vertices; i++) {
    const auto offset = space_dim * i;
  
    const auto px = pos[offset    ];
    const auto py = pos[offset + 1];
  
    const auto p0x = pos0[offset    ];
    const auto p0y = pos0[offset + 1];
  
    accumulate_gravity_energy(
      potential_energy,
      py,
      vertex_mass,
      g
    );
  
    accumulate_collision_energy(
      potential_energy,
      py
    );
  
    accumulate_friction_energy(
      potential_energy,
      px,
      p0x, p0y,
      h,
      k_friction
    );
  }
  return 0.5 * inertial_energy + h * h * potential_energy;
}

static void backward_euler_loss_grad(
  float g, float h, int num_vertices, const float* pos0, const float* vel0, float vertex_mass, int num_muscles, const int* muscles, float k, const float* a, const float* l0, int num_triangles, const int* triangles, const float* rsi, float mu, float lambda, float k_friction, const float* pos, const float* pos_grad
) {
  __enzyme_autodiff(
    backward_euler_loss,
    enzyme_const, g,
    enzyme_const, h,
    enzyme_const, num_vertices,
    enzyme_const, pos0,
    enzyme_const, vel0,
    enzyme_const, vertex_mass,
    enzyme_const, num_muscles,
    enzyme_const, muscles,
    enzyme_const, k,
    enzyme_const, a,
    enzyme_const, l0,
    enzyme_const, num_triangles,
    enzyme_const, triangles,
    enzyme_const, rsi,
    enzyme_const, mu,
    enzyme_const, lambda,
    enzyme_const, k_friction,
    enzyme_dup, pos, pos_grad
  );
}


void backward_euler_update_pos(
  float g, float h, int num_vertices, const float* pos0, const float* vel0, float vertex_mass, int num_muscles, const int* muscles, float k, const float* a, const float* l0, int num_triangles, const int* triangles, const float* rsi, float mu, float lambda, float k_friction, float* pos, float* pos_grad, float* pos_tmp, int fixed_vertex_id
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

extern "C"
void backward_euler_update(
    float g, float h, int num_vertices, const float* pos0, const float* vel0, float vertex_mass, int num_muscles, const int* muscles, float k, const float* a, const float* l0, int num_triangles, const int* triangles, const float* rsi, float mu, float lambda, float k_friction, int fixed_vertex_id, float* pos1, float* pos_grad, float* pos_tmp, float* vel1
) {
  const auto space_dim = 2;
  backward_euler_update_pos(g, h, num_vertices, pos0, vel0, vertex_mass, num_muscles, muscles, k, a, l0, num_triangles, triangles, rsi, mu, lambda, k_friction, pos1, pos_grad, pos_tmp, fixed_vertex_id);
  backward_euler_update_vel(num_vertices, space_dim, pos0, vel0, pos1, vel1, h);
}

}