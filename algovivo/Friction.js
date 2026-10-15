export default class Friction {
  constructor(args = {}) {
    this.k = args.k ?? Math.fround(300);
  }

  stepArgs() {
    return { k_friction: this.k };
  }

  dispose() {}
}
