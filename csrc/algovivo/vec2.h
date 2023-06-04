#pragma once

#define vec2_get(name, x, i) \
  const auto (name##x) = x[2 * i    ]; \
  const auto (name##y) = x[2 * i + 1];

#define vec2_sub(r, a, b) \
  const auto (r##x) = (a##x) - (b##x); \
  const auto (r##y) = (a##y) - (b##y);