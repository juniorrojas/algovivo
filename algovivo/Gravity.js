export default class Gravity {
  constructor(args = {}) {
    this.g = args.g ?? 9.8;
  }

  stepArgs() {
    return { g: this.g };
  }

  dispose() {}
}
