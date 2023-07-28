const mmgrten = require("./mmgrten");

class System {
  constructor(args = {}) {
    if (args.wasmInstance == null) {
      throw new Error("wasmInstance required");
    }
    const ten = new mmgrten.Engine({
      wasmInstance: args.wasmInstance
    });
    this.ten = ten;

    const wasmInstance = ten.wasmInstance;
    const memoryManager = ten.mgr;

    this.wasmInstance = wasmInstance;
    this.memoryManager = memoryManager;
    this.fixedVertexId = -1;

    const h = 0.033;
    this.h = h;

    this.spaceDim = 2;
  }

  numVertices() {
    if (this.x0 == null) return 0;
    return this.x0.shape.get(0);
  }

  numTriangles() {
    if (this.triangles == null) return 0;
    return this.triangles.u32().length / 3;
  }

  numSprings() {
    if (this.springs == null) return 0;
    return this.springs.u32().length / 2;
  }

  setX(x) {
    const ten = this.ten;
    
    const spaceDim = this.spaceDim;
    const numVertices = x.length;

    const x0 = ten.tensor(x);
    if (this.x0 != null) this.x0.dispose();
    this.x0 = x0;

    const x1 = ten.zeros([numVertices, spaceDim]);
    if (this.x1 != null) this.x1.dispose();
    this.x1 = x1;

    const v0 = ten.zeros([numVertices, spaceDim]);
    if (this.v0 != null) this.v0.dispose()
    this.v0 = v0;

    const v1 = ten.zeros([numVertices, spaceDim]);
    if (this.v1 != null) this.v1.dispose();
    this.v1 = v1;

    this.updateTmpBuffers();
  }

  setSprings(args = {}) {
    if (args.indices == null) {
      throw new Error("indices required");
    }
    const indices = args.indices;
    const numSprings = indices.length;

    const mgr = this.memoryManager;
    const ten = this.ten;

    const springs = mgr.malloc32(numSprings * 2);
    if (this.springs != null) this.springs.free();
    this.springs = springs;

    const springsU32 = springs.u32();
    indices.forEach((s, i) => {
      springsU32[i * 2    ] = s[0];
      springsU32[i * 2 + 1] = s[1];
    });

    if (this.l0 != null) this.l0.dispose();
    this.l0 = null;

    if (numSprings != 0) {
      const l0 = ten.zeros([numSprings]);
      this.l0 = l0;

      if (args.l0 == null) {
        this.wasmInstance.exports.l0_of_x(
          this.numVertices(),
          this.x0.ptr,
          numSprings,
          this.springs.ptr,
          this.l0.ptr
        );
      } else {
        this.l0.set(args.l0);
      }
    }

    if (this.a != null) this.a.dispose();
    this.a = null;

    if (numSprings != 0) {
      // TODO a = ten.ones([numSprings]);
      const a = ten.zeros([numSprings]);
      this.a = a;
      const aF32 = a.slot.f32();
      for (let i = 0; i < numSprings; i++) {
        aF32[i] = 1;
      }
    }
  }

  setTriangles(args = {}) {
    if (args.indices == null) {
      throw new Error("indices required");
    }
    const indices = args.indices;
    const numTriangles = indices.length;

    const mgr = this.memoryManager;
    const ten = this.ten;
    
    const triangles = mgr.malloc32(numTriangles * 3);
    if (this.triangles != null) this.triangles.free();
    this.triangles = triangles;

    const trianglesU32 = triangles.u32();
    indices.forEach((t, i) => {
      const offset = i * 3;
      trianglesU32[offset    ] = t[0];
      trianglesU32[offset + 1] = t[1];
      trianglesU32[offset + 2] = t[2];
    });

    const rsi = ten.zeros([numTriangles, 2, 2]);
    if (this.rsi != null) this.rsi.dispose();
    this.rsi = rsi;
    
    if (args.rsi == null) {
      this.wasmInstance.exports.rsi_of_x(
        this.numVertices(),
        this.x0.ptr,
        numTriangles,
        this.triangles.ptr,
        this.rsi.ptr
      );
    } else {
      this.rsi.set(args.rsi);
    }
  }

  set(data) {
    this.setX(data.x);
    
    // const r = ten.zeros([numVertices]);
    // if (this.r != null) this.r.dispose();
    // this.r = r;
    this.r = null;

    this.setSprings({
      indices: data.springs ?? [],
      l0: data.springsL0
    });
    
    this.setTriangles({
      indices: data.triangles ?? [],
      rsi: data.trianglesRsi
    });
  }

  updateTmpBuffers() {
    if (this.x0 == null) {
      throw new Error("x0 required");
    }
    const numVertices = this.numVertices();
    const spaceDim = this.spaceDim;
    const ten = this.ten;
    
    // TODO only allocate new memory if necessary
    const xGrad = ten.zeros([numVertices, spaceDim]);
    if (this.xGrad != null) this.xGrad.dispose();
    this.xGrad = xGrad;

    const xTmp = ten.zeros([numVertices, spaceDim]);
    if (this.xTmp != null) this.xTmp.dispose();
    this.xTmp = xTmp;
  }

  step() {
    const numVertices = this.numVertices();
    const numSprings = this.numSprings();
    const numTriangles = this.numTriangles();

    const fixedVertexId = this.fixedVertexId;

    this.wasmInstance.exports.backward_euler_update(
      numVertices,
      
      this.x1.ptr,
      this.xGrad.ptr,
      this.xTmp.ptr,

      this.x0.ptr,

      this.v0.ptr,
      this.v1.ptr,
      
      this.h,

      // this.r.ptr,
      0,

      numSprings,
      numSprings == 0 ? 0 : this.springs.ptr,

      numTriangles,
      numTriangles == 0 ? 0 : this.triangles.ptr,
      numTriangles == 0 ? 0 : this.rsi.ptr,

      numSprings == 0 ? 0 : this.a.ptr,
      numSprings == 0 ? 0 : this.l0.ptr,
      
      fixedVertexId
    );

    this.x0.slot.f32().set(this.x1.slot.f32());
    this.v0.slot.f32().set(this.v1.slot.f32());
  }

  dispose() {
    if (this.x0 != null) {
      this.x0.dispose();
      this.x0 = null;
    }
    if (this.x1 != null) {
      this.x1.dispose();
      this.x1 = null;
    }
    if (this.xGrad != null) {
      this.xGrad.dispose();
      this.xGrad = null;
    }
    if (this.xTmp != null) {
      this.xTmp.dispose();
      this.xTmp = null;
    }
    if (this.v0 != null) {
      this.v0.dispose();
      this.v0 = null;
    }
    if (this.v1 != null) {
      this.v1.dispose();
      this.v1 = null;
    }

    if (this.triangles != null) {
      this.triangles.free();
      this.triangles = null;
    }
    if (this.rsi != null) {
      this.rsi.dispose();
      this.rsi = null;
    }

    if (this.springs != null) {
      this.springs.free();
      this.springs = null;
    }
    if (this.l0 != null) {
      this.l0.dispose();
      this.l0 = null;
    }
    if (this.a != null) {
      this.a.dispose();
      this.a = null;
    }
  }
}

module.exports = System;