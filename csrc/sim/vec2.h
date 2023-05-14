#pragma once

#define vec2_sub(r, a, b) \
  const auto (r##x) = (a##x) - (b##x); \
  const auto (r##y) = (a##y) - (b##y);