const Module = require("./Module");

class Tanh extends Module {
  constructor(nn) {
    super();
    this.nn = nn;
    this.output = null;
  }

  forward(x) {
    const ten = this.nn.engine;
    // TODO check shape consistency if input has different shape
    if (this.output == null) {
      this.output = ten.zerosLike(x);
    }
    ten.functional.tanh(x, this.output);
    return this.output;
  }
}

module.exports = Tanh;