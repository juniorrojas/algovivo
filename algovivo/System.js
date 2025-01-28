const mmgrten = require("./mmgrten");
const Vertices = require("./Vertices");
const Muscles = require("./Muscles");
const Triangles = require("./Triangles");

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
    
    this.h = 0.033;
    this.g = 9.8;

    this.spaceDim = args.spaceDim ?? 2;

    this.vertices = new Vertices({ ten: this.ten, vertexMass: args.vertexMass, spaceDim: this.spaceDim });
    this._muscles = new Muscles({ ten: this.ten });
    this._triangles = new Triangles({ ten: this.ten, simplexOrder: this.spaceDim + 1 });

    this.friction = { k: Math.fround(300) }
  }

  set fixedVertexId(value) {
    throw new Error("System.fixedVertexId setter is deprecated, use System.vertices.fixedVertexId instead");
  }

  get fixedVertexId() {
    throw new Error("System.fixedVertexId getter is deprecated, use System.vertices.fixedVertexId instead");
  }

  get wasmInstance() {
    return this.ten.wasmInstance;
  }

  get memoryManager() {
    return this.ten.mgr;
  }

  get vertexMass() {
    return this.vertices.vertexMass;
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

  get pos0() {
    return this.vertices.pos;
  }

  get vel0() {
    return this.vertices.vel0;
  }

  get pos() {
    return this.vertices.pos;
  }

  get vel() {
    return this.vertices.vel;
  }

  get numVertices() {
    return this.vertices.numVertices;
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
    this.vertices.set(pos);
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

  step() {
    const numVertices = this.numVertices;
    const numMuscles = this.numMuscles;

    const fixedVertexId = this.vertices._fixedVertexId;
    const vertexMass = this.vertexMass;

    this.wasmInstance.exports.backward_euler_update(
      this.spaceDim,
      this.g,
      this.h,

      numVertices,
      numVertices == 0 ? 0 : this.pos0.ptr,
      numVertices == 0 ? 0 : this.vel0.ptr,
      vertexMass,

      numMuscles,
      numMuscles == 0 ? 0 : this.muscles.ptr,
      this.k,
      numMuscles == 0 ? 0 : this.a.ptr,
      numMuscles == 0 ? 0 : this.l0.ptr,

      ...this._triangles.toStepArgs(),

      this.friction.k,

      fixedVertexId,

      numVertices == 0 ? 0 : this.vertices.pos1.ptr,
      numVertices == 0 ? 0 : this.vertices.posGrad.ptr,
      numVertices == 0 ? 0 : this.vertices.posTmp.ptr,
      numVertices == 0 ? 0 : this.vertices.vel1.ptr,
    );
    
    if (numVertices != 0) {
      this.vertices.pos0.slot.f32().set(this.vertices.pos1.slot.f32());
      this.vertices.vel0.slot.f32().set(this.vertices.vel1.slot.f32());
    }
  }

  dispose() {
    this.vertices.dispose();
    this._muscles.dispose();
    this._triangles.dispose();
  }
}

module.exports = System;