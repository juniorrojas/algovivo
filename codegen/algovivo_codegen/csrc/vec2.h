#pragma once

#define vec2_get(name, arr, i) \
  const auto (name##x) = arr[2 * i    ]; \
  const auto (name##y) = arr[2 * i + 1];

#define vec2_sub(r, a, b) \
  const auto (r##x) = (a##x) - (b##x); \
  const auto (r##y) = (a##y) - (b##y);

namespace algovivo {

__attribute__((always_inline))
float vec2_q(const float* pos, int i1, int i2) {
  const auto o1 = i1 * 2;
  const auto o2 = i2 * 2;
  const auto d0 = pos[o1    ] - pos[o2    ];
  const auto d1 = pos[o1 + 1] - pos[o2 + 1];
  return d0 * d0 + d1 * d1;
}

}
