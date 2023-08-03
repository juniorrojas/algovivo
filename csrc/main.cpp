#include "mmgrten/mmgrten.h"
#include "algovivo/algovivo.h"

namespace algovivo {

static float backward_euler_loss(
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
    vec2_get(p, x, i);
    vec2_get(v, v0, i);
    vec2_get(p0, x0, i);
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

static void backward_euler_loss_grad(
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

extern "C"
void backward_euler_update(
  int num_vertices,
  float* x1, float* x_grad, float* x_tmp,
  float* x0,
  float* v0, float* v1,
  float h,
  float* r,

  int num_springs,
  int* springs,

  int num_triangles,
  int* triangles,
  float* rsi,

  float* a,
  float* l0,

  int fixed_vertex_id
) {
  algovivo::System system;

  system.h = h;

  system.num_vertices = num_vertices;
  system.x0 = x0;
  system.v0 = v0;
  system.r = r;

  system.num_springs = num_springs;
  system.springs = springs;
  system.a = a;
  system.l0 = l0;

  system.num_triangles = num_triangles;
  system.triangles = triangles;
  system.rsi = rsi;

  system.fixed_vertex_id = fixed_vertex_id;

  algovivo::backward_euler_update(
    system,
    x1, v1,
    x_grad, x_tmp
  );
}

}
