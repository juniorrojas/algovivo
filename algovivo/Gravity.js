class Gravity {
  constructor(args = {}) {
    this.g = args.g ?? 9.8;
  }

  toStepArgs() {
    return [this.g];
  }

  dispose() {}
}

module.exports = Gravity;
