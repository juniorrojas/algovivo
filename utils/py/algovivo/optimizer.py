class Optimizer:
    def __init__(
        self,
        max_iters=100,
        initial_step_size=1.0,
        backtracking_scale=0.3,
        max_line_search_iters=20,
        grad_q_tol=0.5 * 1e-5
    ):
        self.max_iters = max_iters
        self.initial_step_size = float(initial_step_size)
        self.backtracking_scale = float(backtracking_scale)
        self.max_line_search_iters = max_line_search_iters
        self.grad_q_tol = float(grad_q_tol)

    def to_step_args(self):
        return (
            self.max_iters,
            self.initial_step_size,
            self.backtracking_scale,
            self.max_line_search_iters,
            self.grad_q_tol
        )
