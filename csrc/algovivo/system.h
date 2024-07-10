#pragma once

#include "vec2.h"
#include "dynamics/inertia.h"
#include "potential/friction.h"
#include "potential/collision.h"
#include "potential/gravity.h"

namespace algovivo {

static float backward_euler_loss(
  float g, float h, int num_vertices, const float* pos, const float* pos0, const float* vel0, float vertex_mass, int num_muscles, const int* muscles, float k, const float* a, const float* l0, int num_triangles, const int* triangles, const float* rsi
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
      1, 500, 50
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
      h
    );
  }
  return 0.5 * inertial_energy + h * h * potential_energy;
}

static void backward_euler_loss_grad(
  float g, float h, int num_vertices, const float* pos, const float* pos_grad, const float* pos0, const float* vel0, float vertex_mass, int num_muscles, const int* muscles, float k, const float* a, const float* l0, int num_triangles, const int* triangles, const float* rsi
) {
  __enzyme_autodiff(
    backward_euler_loss,
    enzyme_const, g,
    enzyme_const, h,
    enzyme_const, num_vertices,
    enzyme_dup, pos, pos_grad,
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
    enzyme_const, rsi
  );
}

struct System {
  float g;
  float h;
  int num_vertices;
  const float* pos0;
  const float* vel0;
  float vertex_mass;
  int num_muscles;
  const int* muscles;
  float k;
  const float* a;
  const float* l0;
  int num_triangles;
  const int* triangles;
  const float* rsi;
  int fixed_vertex_id;
  

  float forward(float* pos) {
    return backward_euler_loss(
      g, h, num_vertices, pos, pos0, vel0, vertex_mass, num_muscles, muscles, k, a, l0, num_triangles, triangles, rsi
    );
  }

  void backward(float* pos, float* pos_grad) {
    backward_euler_loss_grad(
      g, h, num_vertices, pos, pos_grad, pos0, vel0, vertex_mass, num_muscles, muscles, k, a, l0, num_triangles, triangles, rsi
    );
  }
};

extern "C"
void backward_euler_update(
  float g, float h, int num_vertices, const float* pos0, const float* vel0, float vertex_mass, int num_muscles, const int* muscles, float k, const float* a, const float* l0, int num_triangles, const int* triangles, const float* rsi, int fixed_vertex_id, float* pos1, float* pos_grad, float* pos_tmp, float* vel1
) {
  algovivo::System system;

  system.g = g;
  system.h = h;
  system.num_vertices = num_vertices;
  system.pos0 = pos0;
  system.vel0 = vel0;
  system.vertex_mass = vertex_mass;
  system.num_muscles = num_muscles;
  system.muscles = muscles;
  system.k = k;
  system.a = a;
  system.l0 = l0;
  system.num_triangles = num_triangles;
  system.triangles = triangles;
  system.rsi = rsi;
  system.fixed_vertex_id = fixed_vertex_id;
  

  algovivo::backward_euler_update(
    system,
    pos1, vel1,
    pos_grad, pos_tmp
  );
}

}