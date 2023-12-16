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
    this.vertexMass = args.vertexMass ?? 6.0714287757873535;

    const h = 0.033;
    this.h = h;

    this.spaceDim = 2;
  }

  get pos() {
    return this.x0;
  }

  get vel() {
    return this.v0;
  }

  get numVertices() {
    if (this.x0 == null) return 0;
    return this.x0.shape.get(0);
  }

  get numTriangles() {
    if (this.triangles == null) return 0;
    return this.triangles.u32().length / 3;
  }

  get numMuscles() {
    if (this.muscles == null) return 0;
    return this.muscles.u32().length / 2;
  }

  setX(x) {
    const ten = this.ten;
    
    const spaceDim = this.spaceDim;

    if (x == null) throw new Error("pos required");
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

  setMuscles(args = {}) {
    if (args.indices == null) {
      throw new Error("indices required");
    }
    const indices = args.indices;
    const numMuscles = indices.length;
    const numMuscles0 = this.numMuscles;

    const mgr = this.memoryManager;
    const ten = this.ten;

    const muscles = mgr.malloc32(numMuscles * 2);
    if (this.muscles != null) this.muscles.free();
    this.muscles = muscles;

    const musclesU32 = muscles.u32();
    indices.forEach((s, i) => {
      const offset = i * 2;
      musclesU32[offset    ] = s[0];
      musclesU32[offset + 1] = s[1];
    });

    if (this.l0 != null) this.l0.dispose();
    this.l0 = null;

    if (numMuscles != 0) {
      const l0 = ten.zeros([numMuscles]);
      this.l0 = l0;

      if (args.l0 == null) {
        this.wasmInstance.exports.l0_of_pos(
          this.numVertices,
          this.x0.ptr,
          numMuscles,
          this.muscles.ptr,
          this.l0.ptr
        );
      } else {
        this.l0.set(args.l0);
      }
    }

    const keepA = args.keepA ?? false;
    if (numMuscles != numMuscles0) {
      if (keepA) {
        throw new Error(`keepA can only be true when the number of muscles is the same (${numMuscles} != ${numMuscles0})`);
      }
      if (this.a != null) this.a.dispose();
      if (numMuscles != 0) {
        const a = ten.zeros([numMuscles]);
        this.a = a;
        a.fill_(1);
      }
    } else
    if (numMuscles == 0) {
      if (this.a != null) this.a.dispose();
      this.a = null;
    } else {
      // numMuscles == numMuscles0 != 0
      if (!keepA) {
        this.a.fill_(1);
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
      this.wasmInstance.exports.rsi_of_pos(
        this.numVertices,
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
    this.setX(data.pos);
    
    // const r = ten.zeros([numVertices]);
    // if (this.r != null) this.r.dispose();
    // this.r = r;
    this.r = null;

    this.setMuscles({
      indices: data.muscles ?? [],
      l0: data.musclesL0
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
    const numVertices = this.numVertices;
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
    const numVertices = this.numVertices;
    const numMuscles = this.numMuscles;
    const numTriangles = this.numTriangles;

    const fixedVertexId = this.fixedVertexId;
    const vertexMass = this.vertexMass;

    this.wasmInstance.exports.backward_euler_update(
      numVertices,
      
      numVertices == 0 ? 0 : this.x1.ptr,
      numVertices == 0 ? 0 : this.xGrad.ptr,
      numVertices == 0 ? 0 : this.xTmp.ptr,

      numVertices == 0 ? 0 : this.x0.ptr,

      numVertices == 0 ? 0 : this.v0.ptr,
      numVertices == 0 ? 0 : this.v1.ptr,
      
      this.h,

      // this.r.ptr,
      0,

      numMuscles,
      numMuscles == 0 ? 0 : this.muscles.ptr,

      numTriangles,
      numTriangles == 0 ? 0 : this.triangles.ptr,
      numTriangles == 0 ? 0 : this.rsi.ptr,

      numMuscles == 0 ? 0 : this.a.ptr,
      numMuscles == 0 ? 0 : this.l0.ptr,
      
      fixedVertexId,

      vertexMass
    );
    
    if (numVertices != 0) {
      this.x0.slot.f32().set(this.x1.slot.f32());
      this.v0.slot.f32().set(this.v1.slot.f32());
    }
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

    if (this.muscles != null) {
      this.muscles.free();
      this.muscles = null;
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