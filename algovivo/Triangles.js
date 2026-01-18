class Triangles {
  constructor(args = {}) {
    const ten = args.ten;
    if (ten == null) throw new Error("ten required");
    this.ten = ten;

    this.simplexOrder = args.simplexOrder ?? 3;
    this.indices = null;
    this.rsi = null;
    this.mu = null;
    this.lambda = null;
  }

  get wasmInstance() {
    return this.ten.wasmInstance;
  }

  get memoryManager() {
    return this.ten.mgr;
  }

  get numElements() {
    if (this.indices == null) return 0;
    return this.indices.numel / this.simplexOrder;
  }

  get numTriangles() {
    return this.numElements;
  }

  toStepArgs() {
    const numElements = this.numElements;
    return [
      numElements,
      numElements == 0 ? 0 : this.indices.ptr,
      numElements == 0 ? 0 : this.rsi.ptr,
      numElements == 0 ? 0 : this.mu.ptr,
      numElements == 0 ? 0 : this.lambda.ptr
    ];
  }

  set(args = {}) {
    const indices = args.indices;
    const rsi = args.rsi;
    const numTriangles = indices ? indices.length : this.numTriangles;

    if (indices == null && (!rsi || rsi.length !== numTriangles)) {
      throw new Error("rsi is not consistent with the number of indices");
    }

    const ten = this.ten;

    if (indices) {
      if (this.indices != null) this.indices.dispose();
      this.indices = ten.intTensor([numTriangles * this.simplexOrder]);
    }

    if (indices != null) {
      const trianglesU32 = this.indices.typedArray();
      indices.forEach((t, i) => {
        const offset = i * this.simplexOrder;
        for (let j = 0; j < this.simplexOrder; j++) {
          trianglesU32[offset + j] = t[j];
        }
      });
    }
    
    if (this.rsi != null) this.rsi.dispose();
    this.rsi = ten.zeros([numTriangles, this.simplexOrder - 1, this.simplexOrder - 1]);
    
    if (rsi == null) {
      let pos = null;
      let tmpPos = false;
      if (args.pos != null) {
        if (Array.isArray(args.pos)) {
          pos = ten.tensor(args.pos);
          tmpPos = true;
        } else {
          pos = args.pos;
          if (pos.ptr == null) throw new Error("invalid pos");
        }
      }

      this.wasmInstance.exports.rsi_of_pos(
        this.numVertices,
        pos.ptr,
        numTriangles,
        this.indices.ptr,
        this.rsi.ptr
      );

      if (tmpPos) pos.dispose();
    } else {
      this.rsi.set(rsi);
    }
    
    if (this.mu != null) this.mu.dispose();
    this.mu = ten.zeros([numTriangles]);
    this.mu.fill_(Math.fround(500));

    if (this.lambda != null) this.lambda.dispose();
    this.lambda = ten.zeros([numTriangles]);
    this.lambda.fill_(Math.fround(50));
  }

  dispose() {
    if (this.indices != null) {
      this.indices.dispose();
      this.indices = null;
    }
    if (this.rsi != null) {
      this.rsi.dispose();
      this.rsi = null;
    }
    if (this.mu != null) {
      this.mu.dispose();
      this.mu = null;
    }
    if (this.lambda != null) {
      this.lambda.dispose();
      this.lambda = null;
    }
  }
}

module.exports = Triangles;