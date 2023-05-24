const Module = require("./Module");

class Sequential extends Module {
  constructor(nn, layers) {
    super();
    this.nn = nn;
    this.layers = layers;
  }

  forward(x) {
    let x1 = x;
    this.layers.forEach(layer => {
      x1 = layer.forward(x1);
    });
    return x1;
  }

  dispose() {
    
  }
}

module.exports = Sequential;