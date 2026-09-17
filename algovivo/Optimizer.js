export default class Optimizer {
  constructor(args = {}) {
    this.maxIters = args.maxIters ?? 100;
    this.initialStepSize = args.initialStepSize ?? Math.fround(1);
    this.backtrackingScale = args.backtrackingScale ?? Math.fround(0.3);
    this.maxLineSearchIters = args.maxLineSearchIters ?? 20;
    this.gradQTol = args.gradQTol ?? Math.fround(0.5 * 1e-5);
  }

  toStepArgs() {
    return [
      this.maxIters,
      this.initialStepSize,
      this.backtrackingScale,
      this.maxLineSearchIters,
      this.gradQTol
    ];
  }

  dispose() {}
}
