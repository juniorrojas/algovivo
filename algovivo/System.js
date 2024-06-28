const mmgrten = require("./mmgrten");
const Triangles = require("./Triangles");
const Muscles = require("./Muscles");

class System {
  constructor(args = {}) {
    let ten;
    if (args.ten == null) {
      const wasmInstance = args.wasmInstance;
      if (wasmInstance == null) {
        throw new Error("wasmInstance required");
      }
      ten = new mmgrten.Engine({
        wasmInstance: args.wasmInstance
      });
      this.ten = ten;
    } else {
      ten = args.ten;
      this.ten = ten;
    }
    
    this.fixedVertexId = -1;
    this.vertexMass = args.vertexMass ?? 6.0714287757873535;
    this.h = 0.033;
    this.g = 9.8;

    this.spaceDim = 2;

    this._muscles = new Muscles({ ten: this.ten });
    this._triangles = new Triangles({ ten: this.ten });
  }

  get wasmInstance() {
    return this.ten.wasmInstance;
  }

  get memoryManager() {
    return this.ten.mgr;
  }

  get triangles() {
    return this._triangles.triangles;
  }

  set triangles(value) {
    this._triangles.triangles = value;
  }

  get rsi() {
    return this._triangles.rsi;
  }

  set rsi(value) {
    this._triangles.rsi = value;
  }

  get k() {
    return this._muscles.k;
  }

  set k(value) {
    this._muscles.k = value;
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
    return this._triangles.numTriangles;
  }

  get numMuscles() {
    return this._muscles.numMuscles;
  }

  get muscles() {
    return this._muscles.muscles;
  }

  set muscles(value) {
    this._muscles.muscles = value;
  }

  get a() {
    return this._muscles.a;
  }

  set a(value) {
    this._muscles.a = value;
  }

  get l0() {
    return this._muscles.l0;
  }

  set l0(value) {
    this._muscles.l0 = value;
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
    this._muscles.set({ ...args, pos: args.pos ?? this.pos0 });
  }

  setTriangles(args = {}) {
    this._triangles.set({ ...args, pos: args.pos ?? this.pos0 });
  }

  getMusclesArray() {
    if (this.muscles == null) return [];
    
    const numMuscles = this.numMuscles;
    const musclesU32 = this.muscles.u32();
    const muscles = [];
    for (let i = 0; i < numMuscles; i++) {
      const offset = i * 2;
      muscles.push([
        musclesU32[offset    ],
        musclesU32[offset + 1]
      ]);
    }
    return muscles;
  }

  getTrianglesArray() {
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

      vertexMass,

      this.g
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

    this._muscles.dispose();
  }
}

module.exports = System;