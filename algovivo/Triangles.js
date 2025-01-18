class Triangles {
  constructor(args = {}) {
    const ten = args.ten;
    if (ten == null) throw new Error("ten required");
    this.ten = ten;

    this.simplexOrder = args.simplexOrder ?? 3;
    this.triangles = null;
    this.rsi = null;
    this.mu = Math.fround(500);
    this.lambda = Math.fround(50);
  }

  get wasmInstance() {
    return this.ten.wasmInstance;
  }

  get memoryManager() {
    return this.ten.mgr;
  }

  get numElements() {
    if (this.indices == null) return 0;
    return this.indices.u32().length / this.simplexOrder;
  }

  get numTriangles() {
    return this.numElements;
  }

  get indices() {
    return this.triangles;
  }

  toStepArgs() {
    const numElements = this.numElements;
    return [
      numElements,
      numElements == 0 ? 0 : this.indices.ptr,
      numElements == 0 ? 0 : this.rsi.ptr,
      this.mu,
      this.lambda
    ]
  }

  set(args = {}) {
    const indices = args.indices;
    const rsi = args.rsi;
    const numTriangles = indices ? indices.length : this.numTriangles;

    if (indices == null && (!rsi || rsi.length !== numTriangles)) {
      throw new Error("rsi is not consistent with the number of indices");
    }

    const mgr = this.memoryManager;
    const ten = this.ten;
    
    const triangles = indices ? mgr.malloc32(numTriangles * this.simplexOrder) : this.triangles;
    if (indices && this.triangles != null) this.triangles.free();
    this.triangles = triangles;

    if (indices != null) {
      const trianglesU32 = triangles.u32();
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
        this.triangles.ptr,
        this.rsi.ptr
      );

      if (tmpPos) pos.dispose();
    } else {
      this.rsi.set(rsi);
    }
  }

  dispose() {
    if (this.triangles != null) {
      this.triangles.free();
      this.triangles = null;
    }
    if (this.rsi != null) {
      this.rsi.dispose();
      this.rsi = null;
    }
  }
}

module.exports = Triangles;