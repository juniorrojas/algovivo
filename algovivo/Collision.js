class Collision {
  constructor(args = {}) {
    this.k = args.k ?? Math.fround(14000);
  }

  toStepArgs() {
    return [this.k];
  }

  dispose() {}
}

module.exports = Collision;
