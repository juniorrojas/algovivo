const Sequential = require("./Sequential");
const Linear = require("./Linear");
const ReLU = require("./ReLU");
const Tanh = require("./Tanh");

class nn {
  constructor(args = {}) {
    this.engine = args.engine;
  }

  Linear(inputSize, outputSize) {
    return new Linear(this, inputSize, outputSize);
  }

  ReLU() {
    return new ReLU(this);
  }

  Tanh() {
    return new Tanh(this);
  }

  Sequential() {
    const layers = Array.from(arguments);
    return new Sequential(this, layers);
  }
}

module.exports = nn;