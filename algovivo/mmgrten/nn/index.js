import Sequential from "./Sequential.js";
import Linear from "./Linear.js";
import ReLU from "./ReLU.js";
import Tanh from "./Tanh.js";

export default class nn {
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
