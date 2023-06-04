#include "mmgrten/mmgrten.h"
#include "algovivo/algovivo.h"

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
  system.x_grad = x_grad;
  system.x_tmp = x_tmp;
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
    x1, v1
  );
}
