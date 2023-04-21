const Module = require("./Module");

class Linear extends Module {
  constructor(nn, inputSize, outputSize) {
    super();
    this.nn = nn;
    this.inputSize = inputSize;
    this.outputSize = outputSize;

    const ten = this.nn.engine;

    this.weight = ten.zeros([outputSize, inputSize]);
    this.bias = ten.zeros([outputSize]);

    this.output = ten.zeros([outputSize]);
  }

  forward(x) {
    const F = this.nn.engine.functional;
    F.matvec(this.weight, x, this.output);
    F.add(this.output, this.bias, this.output);
    return this.output;
  }
}

module.exports = Linear;