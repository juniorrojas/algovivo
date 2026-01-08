class Friction {
  constructor(args = {}) {
    this.k = args.k ?? Math.fround(300);
  }

  toStepArgs() {
    return [this.k];
  }

  dispose() {}
}

module.exports = Friction;
