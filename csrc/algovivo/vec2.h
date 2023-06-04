#pragma once

#define vec2_get(name, arr, i) \
  const auto (name##x) = arr[2 * i    ]; \
  const auto (name##y) = arr[2 * i + 1];

#define vec2_sub(r, a, b) \
  const auto (r##x) = (a##x) - (b##x); \
  const auto (r##y) = (a##y) - (b##y);