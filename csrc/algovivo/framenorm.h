#pragma once

namespace algovivo {

void normalize2d_(float* vx, float* vy) {
  const auto q = *vx * *vx + *vy * *vy;
  if (q == 0) {
    *vx = 1.0;
    *vy = 0.0;
  } else {
    float norm = __builtin_sqrt(q);
    *vx /= norm;
    *vy /= norm;
  }
}

extern "C"
float dot2d(float ax, float ay, float bx, float by) {
  return ax * bx + ay * by;
}

extern "C"
void framenorm_projection(
  int num_vertices,
  const float* x,
  int center_id,
  int forward_id,
  const float* data,
  float* projected_data,
  bool subtract_origin
) {
  const auto space_dim = 2;
  vec2_get(c, x, center_id);
  vec2_get(f, x, forward_id);

  // a, b are the normalized vectors of the frame
  auto ax = fx - cx;
  auto ay = fy - cy;
  normalize2d_(&ax, &ay);
  const auto bx = -ay;
  const auto by =  ax;

  for (int i = 0; i < num_vertices; i++) {
    const auto offset = i * space_dim;    
    auto px = data[offset]; // - cx;
    auto py = data[offset + 1]; // - cy;
    if (subtract_origin) {
      px -= cx;
      py -= cy;
    }
    projected_data[offset    ] = dot2d(ax, ay, px, py);
    projected_data[offset + 1] = dot2d(bx, by, px, py);
  }
}

extern "C"
void cat_xv(
  int num_vertices,
  const float* x,
  const float* v,
  float* policy_input
) {
  int space_dim = 2;
  for (int i = 0; i < num_vertices; i++) {
    const auto offset = i * space_dim;
    policy_input[offset    ] = x[offset    ];
    policy_input[offset + 1] = x[offset + 1];
  }
  for (int i = 0; i < num_vertices; i++) {
    const auto offset = i * space_dim;
    const auto offset2 = num_vertices * 2 + offset;
    policy_input[offset2    ] = v[offset    ];
    policy_input[offset2 + 1] = v[offset + 1];
  }
}

extern "C"
void make_neural_policy_input(
  int num_vertices,
  const float* x,
  const float* v,
  int center_vertex_id,
  int forward_vertex_id,
  float* projected_x,
  float* projected_v,
  float* policy_input
) {
  framenorm_projection(
    num_vertices,
    x,
    center_vertex_id,
    forward_vertex_id,
    x,
    projected_x,
    true
  );

  framenorm_projection(
    num_vertices,
    x,
    center_vertex_id,
    forward_vertex_id,
    v,
    projected_v,
    false
  );

  cat_xv(num_vertices, projected_x, projected_v, policy_input);
}

}