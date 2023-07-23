#pragma once

#define mat2x2_inv(inv, m) \
  const auto (m##_det) = (m##00) * (m##11) - (m##01) * (m##10); \
  const auto (inv##00) =  (m##11) / (m##_det); \
  const auto (inv##01) = (-m##01) / (m##_det); \
  const auto (inv##10) = (-m##10) / (m##_det); \
  const auto (inv##11) =  (m##00) / (m##_det);