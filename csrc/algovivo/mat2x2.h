#pragma once

#define mat2x2_det(m) ((m##00) * (m##11) - (m##01) * (m##10))

#define mat2x2_inv(inv, m) \
  const auto (m##_det) = mat2x2_det(m); \
  const auto (inv##00) =  (m##11) / (m##_det); \
  const auto (inv##01) = (-m##01) / (m##_det); \
  const auto (inv##10) = (-m##10) / (m##_det); \
  const auto (inv##11) =  (m##00) / (m##_det);

#define mat2x2_mm(c00, c01, c10, c11, a00, a01, a10, a11, b00, b01, b10, b11) \
  const auto (c00) = (a00) * (b00) + (a01) * (b10); \
  const auto (c01) = (a00) * (b01) + (a01) * (b11); \
  const auto (c10) = (a10) * (b00) + (a11) * (b10); \
  const auto (c11) = (a10) * (b01) + (a11) * (b11);