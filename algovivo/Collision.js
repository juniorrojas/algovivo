export default class Collision {
  constructor(args = {}) {
    this.k = args.k ?? Math.fround(14000);
  }

  stepArgs() {
    return { k_collision: this.k };
  }

  dispose() {}
}
