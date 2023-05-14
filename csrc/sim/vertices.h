#pragma once

#define get_vertex_2d(name, x, i) \
  const auto (name##x) = x[2 * i    ]; \
  const auto (name##y) = x[2 * i + 1];

#define vertex_loop_context(i, space_dim, x0, x, v) \
  int offset = i * space_dim;\
  float p0x = x0[offset    ];\
  float p0y = x0[offset + 1];\
  float px  =   x[offset    ];\
  float py  =   x[offset + 1];\
  float vx  =   v[offset    ];\
  float vy  =   v[offset + 1]; // \
  // float mi = 1; // TODO get mass