#pragma once

#define _optim_init() { \
  /* {{optim_init_body}} */ \
}

#define loss_backward() { \
  /* {{optim_zero_grads}} */ \
  /* {{loss_grad_fn}} */(/* {{loss_grad_args_call}} */); \
  /* {{grad_projection}} */ \
}

#define break_if_optim_converged() { \
  if (optim_converged(/* {{optim_converged_args}} */)) break; \
}

bool optim_converged(/* {{optim_converged_signature}} */) {
  float grad_max_q = 0.0;
  float grad_q_tol = /* {{grad_q_tol}} */;
  /* {{optim_converged_body}} */
  return grad_max_q < grad_q_tol;
}

#define optim_step() { \
  float step_size = /* {{initial_step_size}} */; \
  const auto max_line_search_iters = /* {{max_line_search_iters}} */; \
  float backtracking_scale = /* {{backtracking_scale}} */; \
  const auto loss0 = /* {{loss_fn}} */(/* {{loss_args_call}} */); \
  for (int i = 0; i < max_line_search_iters; i++) { \
    /* write trial values to _tmp buffers for line search evaluation */ \
    /* {{optim_line_search_update}} */ \
    const auto loss1 = /* {{loss_fn}} */(/* {{optim_call_with_tmp}} */); \
    if (loss1 < loss0) { \
      break; \
    } else { \
      step_size *= backtracking_scale; \
    } \
  } \
  /* {{optim_apply_step}} */ \
}
