export default class Optimizer {
  constructor(args = {}) {
    this.maxIters = args.maxIters ?? 100;
    this.initialStepSize = args.initialStepSize ?? Math.fround(1);
    this.backtrackingScale = args.backtrackingScale ?? Math.fround(0.3);
    this.maxLineSearchIters = args.maxLineSearchIters ?? 20;
    this.gradQTol = args.gradQTol ?? Math.fround(0.5 * 1e-5);
  }

  stepArgs() {
    return {
      max_optim_iters: this.maxIters,
      initial_step_size: this.initialStepSize,
      backtracking_scale: this.backtrackingScale,
      max_line_search_iters: this.maxLineSearchIters,
      grad_q_tol: this.gradQTol
    };
  }

  dispose() {}
}
