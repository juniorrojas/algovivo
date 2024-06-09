const mmgrten = require("./mmgrten");

class System {
  constructor(args = {}) {
    let ten;
    if (args.ten == null) {
      const wasmInstance = args.wasmInstance;
      if (wasmInstance == null) {
        throw new Error("wasmInstance required");
      }
      this.wasmInstance = wasmInstance;
      ten = new mmgrten.Engine({
        wasmInstance: args.wasmInstance
      });
      this.ten = ten;
    } else {
      ten = args.ten;
      this.wasmInstance = ten.wasmInstance;
      this.ten = ten;
    }

    const wasmInstance = ten.wasmInstance;
    const memoryManager = ten.mgr;

    this.wasmInstance = wasmInstance;
    this.memoryManager = memoryManager;
    this.fixedVertexId = -1;
    this.vertexMass = args.vertexMass ?? 6.0714287757873535;
    this.k = 90.0;
    this.h = 0.033;

    this.spaceDim = 2;
  }

  get pos() {
    return this.pos0;
  }

  get vel() {
    return this.vel0;
  }

  get numVertices() {
    if (this.pos0 == null) return 0;
    return this.pos0.shape.get(0);
  }

  get numTriangles() {
    if (this.triangles == null) return 0;
    return this.triangles.u32().length / 3;
  }

  get numMuscles() {
    if (this.muscles == null) return 0;
    return this.muscles.u32().length / 2;
  }

  setVertices(pos) {
    const ten = this.ten;
    
    const spaceDim = this.spaceDim;

    if (pos == null) throw new Error("pos required");
    const numVertices = pos.length;

    const pos0 = ten.tensor(pos);
    if (this.pos0 != null) this.pos0.dispose();
    this.pos0 = pos0;

    const pos1 = ten.zeros([numVertices, spaceDim]);
    if (this.pos1 != null) this.pos1.dispose();
    this.pos1 = pos1;

    const vel0 = ten.zeros([numVertices, spaceDim]);
    if (this.vel0 != null) this.vel0.dispose();
    this.vel0 = vel0;

    const vel1 = ten.zeros([numVertices, spaceDim]);
    if (this.vel1 != null) this.vel1.dispose();
    this.vel1 = vel1;

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

    if (args.k != null) this.k = args.k;

    const muscles = mgr.malloc32(numMuscles * 2);
    if (this.muscles != null) this.muscles.free();
    this.muscles = muscles;

    const musclesU32 = muscles.u32();
    indices.forEach((m, i) => {
      const offset = i * 2;
      musclesU32[offset    ] = m[0];
      musclesU32[offset + 1] = m[1];
    });

    if (this.l0 != null) this.l0.dispose();
    this.l0 = null;

    if (numMuscles != 0) {
      const l0 = ten.zeros([numMuscles]);
      this.l0 = l0;

      if (args.l0 == null) {
        this.wasmInstance.exports.l0_of_pos(
          this.numVertices,
          this.pos0.ptr,
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
      let pos = this.pos0;
      let tmpPos = false;
      if (args.pos != null) {
        if (!Array.isArray(args.pos)) throw new Error("pos must be an array");
        pos = ten.tensor(args.pos);
        tmpPos = true;
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

  getTrianglesArr() {
    if (this.triangles == null) return [];
    
    const numTriangles = this.numTriangles;
    const trianglesU32 = this.triangles.u32();
    const triangles = [];
    for (let i = 0; i < numTriangles; i++) {
      const offset = i * 3;
      triangles.push([
        trianglesU32[offset    ],
        trianglesU32[offset + 1],
        trianglesU32[offset + 2]
      ]);
    }
    return triangles;
  }

  set(args) {
    this.setVertices(args.pos);

    this.setMuscles({
      indices: args.muscles ?? [],
      l0: args.musclesL0,
      k: args.musclesK
    });

    this.setTriangles({
      indices: args.triangles ?? [],
      rsi: args.trianglesRsi
    });
  }

  updateTmpBuffers() {
    if (this.pos0 == null) {
      throw new Error("pos0 required");
    }
    const numVertices = this.numVertices;
    const spaceDim = this.spaceDim;
    const ten = this.ten;
    
    // TODO only allocate new memory if necessary
    const posGrad = ten.zeros([numVertices, spaceDim]);
    if (this.posGrad != null) this.posGrad.dispose();
    this.posGrad = posGrad;

    const posTmp = ten.zeros([numVertices, spaceDim]);
    if (this.posTmp != null) this.posTmp.dispose();
    this.posTmp = posTmp;
  }

  step() {
    const numVertices = this.numVertices;
    const numMuscles = this.numMuscles;
    const numTriangles = this.numTriangles;

    const fixedVertexId = this.fixedVertexId;
    const vertexMass = this.vertexMass;

    this.wasmInstance.exports.backward_euler_update(
      numVertices,
      
      numVertices == 0 ? 0 : this.pos1.ptr,
      numVertices == 0 ? 0 : this.posGrad.ptr,
      numVertices == 0 ? 0 : this.posTmp.ptr,

      numVertices == 0 ? 0 : this.pos0.ptr,

      numVertices == 0 ? 0 : this.vel0.ptr,
      numVertices == 0 ? 0 : this.vel1.ptr,
      
      this.h,

      0,

      numMuscles,
      numMuscles == 0 ? 0 : this.muscles.ptr,

      numTriangles,
      numTriangles == 0 ? 0 : this.triangles.ptr,
      numTriangles == 0 ? 0 : this.rsi.ptr,

      numMuscles == 0 ? 0 : this.a.ptr,
      numMuscles == 0 ? 0 : this.l0.ptr,
      this.k,
      
      fixedVertexId,

      vertexMass
    );
    
    if (numVertices != 0) {
      this.pos0.slot.f32().set(this.pos1.slot.f32());
      this.vel0.slot.f32().set(this.vel1.slot.f32());
    }
  }

  dispose() {
    if (this.pos0 != null) {
      this.pos0.dispose();
      this.pos0 = null;
    }
    if (this.pos1 != null) {
      this.pos1.dispose();
      this.pos1 = null;
    }
    if (this.posGrad != null) {
      this.posGrad.dispose();
      this.posGrad = null;
    }
    if (this.posTmp != null) {
      this.posTmp.dispose();
      this.posTmp = null;
    }
    if (this.vel0 != null) {
      this.vel0.dispose();
      this.vel0 = null;
    }
    if (this.vel1 != null) {
      this.vel1.dispose();
      this.vel1 = null;
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