#pragma once
#include "tensor.h"

namespace mmgrten {

extern "C"
void mm(
  int a_rows,
  int a_cols,
  int b_cols,

  int* a_stride, float* a_data,
  int* b_stride, float* b_data,
  int* c_stride, float* c_data
) {
  for (int i = 0; i < a_rows; i++) {
    for (int j = 0; j < b_cols; j++) {
      float s = 0.0;
      for (int k = 0; k < a_cols; k++) {
        int a_idx[2] = {i, k};
        auto aik = get_tensor_elem(
          2, a_stride, a_data,
          a_idx
        );

        int b_idx[2] = {k, j};
        auto bkj = get_tensor_elem(
          2, b_stride, b_data,
          b_idx
        );
        
        s += aik * bkj;
      }

      int c_idx[2] = {i, j};
      set_tensor_elem(
        2, c_stride, c_data,
        c_idx, s
      );
    }
  }
}

}