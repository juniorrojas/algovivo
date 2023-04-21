class Functional {
  constructor(args = {}) {
    const engine = this.engine = args.engine;
    this.wasmInstance = engine.wasmInstance;
  }

  matvec(a, b, c) {
    const m = a.shape.get(0);
    const n = a.shape.get(1);
    const inputSize = b.shape.get(0);
    const outputSize = c.shape.get(0);
    if (m != outputSize) {
      throw new Error(`inconsistent output size ${m} != ${outputSize}`);
    }
    if (n != inputSize) {
      throw new Error(`inconsistent input size ${n} != ${inputSize}`);
    }
    this.wasmInstance.exports.matvec(
      m, n,
      a.stride.ptr, a.ptr,
      b.stride.ptr, b.ptr,
      c.stride.ptr, c.ptr
    );
  }

  mm(a, b, c) {
    const m = a.shape.get(0);
    const n = a.shape.get(1);
    const p = b.shape.get(1);
    this.wasmInstance.exports.mm(
      m, n, p,
      a.stride.ptr, a.ptr,
      b.stride.ptr, b.ptr,
      c.stride.ptr, c.ptr
    );
  }

  relu(a, b) {
    this.wasmInstance.exports.relu(
      a.numel,
      a.ptr,
      b.ptr
    );
  }

  tanh(a, b) {
    // TODO c++ version
    // this.wasmInstance.exports.tanh(
    //   a.numel,
    //   a.ptr,
    //   b.ptr
    // );
    const n = a.numel;
    const _a = a.typedArray();
    const _b = b.typedArray();
    for (let i = 0; i < n; i++) {
      _b[i] = Math.tanh(_a[i]);
    }
  }
  
  add(a, b, c) {
    this.wasmInstance.exports.add(
      a.numel,
      a.ptr,
      b.ptr,
      c.ptr
    );
  }

  sum(a, s) {
    this.wasmInstance.exports.sum(
      a.numel,
      a.ptr,
      s.ptr
    );
  }

  sumBackward(a, aGrad, s, sGrad) {
    this.wasmInstance.exports.sum_backward(
      a.numel,
      a.ptr,
      aGrad.ptr,
      s.ptr,
      sGrad.ptr
    );
  }
}

module.exports = Functional;