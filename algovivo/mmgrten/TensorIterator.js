const IntTuple = require("./IntTuple");

class TensorIterator {
  constructor(shape) {
    if (shape == null) throw new Error("shape required");
    if (!(shape instanceof IntTuple)) {
      throw new Error(`IntTuple shape expected, found ${typeof shape}: shape`);
    }
    this.shape = shape;
    this.done = false;
    this.idx = [];
    shape.forEach((si) => {
      this.idx.push(0);
    });
  }

  next() {
    const shape = this.shape;
    for (let _i = 0; _i < shape.length; _i++) {
      const i = shape.length - 1 - _i;
      if (this.idx[i] < shape.get(i) - 1) {
        this.idx[i]++;
        return;
      } else
      if (i == 0) {
        this.done = true;
        return;
      } else {
        this.idx[i] = 0;
      }
    }
  }

  static shapeForEach(shape, f) {
    const it = new TensorIterator(shape);
    while (!it.done) {
      f(it.idx);
      it.next();
    }
  }
}

module.exports = TensorIterator;