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
inline float dot2d(float ax, float ay, float bx, float by) {
  return ax * bx + ay * by;
}

extern "C"
void frame_projection(
  int num_vertices,
  const float* pos,
  int center_vertex_id,
  int forward_vertex_id,
  const float* data,
  float* projected_data,
  bool subtract_origin,
  bool clockwise
) {
  // A frame of reference is defined by two vertices: center_vertex_id 
  // (serving as the origin of the frame) and forward_vertex_id. 
  // The forward direction of the frame is defined as the normalized vector 
  // from the center vertex to the forward vertex, using the positions of 
  // these vertices in the pos array.

  const auto space_dim = 2;

  // retrieve the positions of the center and forward vertices
  vec2_get(c, pos, center_vertex_id);
  vec2_get(f, pos, forward_vertex_id);

  // a and b represent the basis vectors of the frame, both normalized to unit length.
  // a is the forward direction vector, pointing from the center vertex to the forward vertex.
  // b is the orthogonal direction vector, computed to be perpendicular to a
  auto ax = fx - cx;
  auto ay = fy - cy;
  normalize2d_(&ax, &ay);
  const auto bx = clockwise ? ay : -ay;
  const auto by = clockwise ? -ax : ax;

  for (int i = 0; i < num_vertices; i++) {
    const auto offset = i * space_dim;
    auto px = data[offset];
    auto py = data[offset + 1];
    if (subtract_origin) {
      px -= cx;
      py -= cy;
    }
    projected_data[offset    ] = dot2d(ax, ay, px, py);
    projected_data[offset + 1] = dot2d(bx, by, px, py);
  }
}

extern "C"
void cat_pos_vel(
  int num_vertices,
  const float* pos,
  const float* vel,
  float* policy_input
) {
  const auto space_dim = 2;
  for (int i = 0; i < num_vertices; i++) {
    const auto offset = i * space_dim;
    policy_input[offset    ] = pos[offset    ];
    policy_input[offset + 1] = pos[offset + 1];
  }
  for (int i = 0; i < num_vertices; i++) {
    const auto offset = i * space_dim;
    const auto offset2 = num_vertices * 2 + offset;
    policy_input[offset2    ] = vel[offset    ];
    policy_input[offset2 + 1] = vel[offset + 1];
  }
}

extern "C"
void make_neural_policy_input(
  int num_vertices,
  const float* pos,
  const float* vel,
  int center_vertex_id,
  int forward_vertex_id,
  float* projected_pos,
  float* projected_vel,
  float* policy_input,
  bool clockwise
) {
  frame_projection(
    // frame of reference
    num_vertices,
    pos,
    center_vertex_id,
    forward_vertex_id,
    // position projection
    pos,
    projected_pos,
    true,
    clockwise
  );

  frame_projection(
    // frame of reference
    num_vertices,
    pos,
    center_vertex_id,
    forward_vertex_id,
    // velocity projection
    vel,
    projected_vel,
    false,
    clockwise
  );

  cat_pos_vel(num_vertices, projected_pos, projected_vel, policy_input);
}

}