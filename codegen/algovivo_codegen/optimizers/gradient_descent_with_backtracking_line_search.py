from pathlib import Path
import os
this_filepath = Path(os.path.realpath(__file__))
templates_dirpath = this_filepath.parent.parent.joinpath("templates")

# yes, this is a first-order method, and you may be thinking that backward Euler
# could converge in fewer iterations with a Hessian approximation and a linear solve,
# but that is just an implementation detail;
# what this project is about is getting the energy functions right,
# and gradient descent with backtracking line search is good enough to
# run the simulation without overcomplicating the loop

class GradientDescentWithBacktrackingLineSearch:

    template_filename = "gradient_descent.template.h"

    def __init__(
        self,
        max_iters=100,
        initial_step_size="1.0",
        backtracking_scale="0.3",
        max_line_search_iters=20,
        grad_q_tol="0.5 * 1e-5"
    ):
        # tolerances are C expressions, not python numbers, so they can be
        # written the way they read in the generated source
        self.max_iters = max_iters
        self.initial_step_size = initial_step_size
        self.backtracking_scale = backtracking_scale
        self.max_line_search_iters = max_line_search_iters
        self.grad_q_tol = grad_q_tol

    @property
    def driver_body(self):
        return f"""_optim_init();
  const auto max_optim_iters = {self.max_iters};
  for (int i = 0; i < max_optim_iters; i++) {{
    loss_backward();
    break_if_optim_converged();
    optim_step();
  }}"""

    def codegen(self, args, loss_fn, grad_projection_src="", init_src=""):
        with open(templates_dirpath.joinpath(self.template_filename)) as f:
            template = f.read()

        grad_args = args.with_tangent_args()

        return (template
            .replace("/* {{optim_init_body}} */", init_src)
            .replace("/* {{optim_zero_grads}} */", args.codegen_optim_zero_grads())
            .replace("/* {{loss_grad_fn}} */", f"{loss_fn}_grad")
            .replace("/* {{loss_grad_args_call}} */", grad_args.codegen_call())
            .replace("/* {{grad_projection}} */", grad_projection_src)
            .replace("/* {{optim_converged_args}} */", args.codegen_optim_converged_args())
            .replace("/* {{optim_converged_signature}} */", args.codegen_optim_converged_signature())
            .replace("/* {{optim_converged_body}} */", args.codegen_optim_converged_body())
            .replace("/* {{grad_q_tol}} */", str(self.grad_q_tol))
            .replace("/* {{initial_step_size}} */", str(self.initial_step_size))
            .replace("/* {{max_line_search_iters}} */", str(self.max_line_search_iters))
            .replace("/* {{backtracking_scale}} */", str(self.backtracking_scale))
            .replace("/* {{loss_fn}} */", loss_fn)
            .replace("/* {{loss_args_call}} */", args.codegen_call())
            .replace("/* {{optim_call_with_tmp}} */", args.codegen_optim_call_with_tmp())
            .replace("/* {{optim_line_search_update}} */", args.codegen_optim_line_search_update())
            .replace("/* {{optim_apply_step}} */", args.codegen_optim_apply_step())
        )
