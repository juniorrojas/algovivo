class Triangles {
  constructor(args = {}) {
    const ten = args.ten;
    if (ten == null) throw new Error("ten required");
    this.ten = ten;

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

  get numTriangles() {
    if (this.triangles == null) return 0;
    return this.triangles.u32().length / 3;
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
    
    const triangles = indices ? mgr.malloc32(numTriangles * 3) : this.triangles;
    if (indices && this.triangles != null) this.triangles.free();
    this.triangles = triangles;

    if (indices != null) {
      const trianglesU32 = triangles.u32();
      indices.forEach((t, i) => {
        const offset = i * 3;
        trianglesU32[offset    ] = t[0];
        trianglesU32[offset + 1] = t[1];
        trianglesU32[offset + 2] = t[2];
      });
    }
    
    if (this.rsi != null) this.rsi.dispose();
    this.rsi = ten.zeros([numTriangles, 2, 2]);
    
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