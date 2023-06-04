#include "mmgrten/mmgrten.h"
#include "sim/sim.h"

extern "C"
void backward_euler_update(
  int num_vertices,
  float* x, float* x_grad, float* x_tmp,
  float* x0,
  float* v, float* v1,
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
  backward_euler_update(
    num_vertices,
    x, x_grad, x_tmp,
    x0,
    v, v1,
    h,
    r,

    num_springs,
    springs,

    num_triangles,
    triangles,
    rsi,

    a,
    l0,

    fixed_vertex_id
  );
}
