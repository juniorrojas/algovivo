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

    this.vertices = new Vertices({
      ten: this.ten,
      vertexMass: args.vertexMass,
      spaceDim: this.spaceDim
    });

    this.muscles = new Muscles({ ten: this.ten });

    this.triangles = new Triangles({
      ten: this.ten,
      simplexOrder: this.spaceDim + 1
    });

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

  get rsi() {
    return this.triangles.rsi;
  }

  set rsi(value) {
    this.triangles.rsi = value;
  }

  get k() {
    return this.muscles.k;
  }

  set k(value) {
    this.muscles.k = value;
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
    return this.triangles.numTriangles;
  }

  get numMuscles() {
    return this.muscles.numMuscles;
  }

  get a() {
    return this.muscles.a;
  }

  set a(value) {
    this.muscles.a = value;
  }

  get l0() {
    return this.muscles.l0;
  }

  set l0(value) {
    this.muscles.l0 = value;
  }

  setVertices(pos) {
    this.vertices.set(pos);
  }

  setMuscles(args = {}) {
    this.muscles.set({ ...args, pos: args.pos ?? this.pos0 });
  }

  setTriangles(args = {}) {
    this.triangles.set({ ...args, pos: args.pos ?? this.pos0 });
  }

  getMusclesArray() {
    if (this.numMuscles == 0) return [];
    
    const numMuscles = this.numMuscles;
    const musclesU32 = this.muscles.indices.u32();
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
    if (this.numTriangles == 0) return [];
    
    const numTriangles = this.numTriangles;
    const trianglesU32 = this.triangles.indices.u32();
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

    const vertexMass = this.vertexMass;

    this.wasmInstance.exports.backward_euler_update(
      this.spaceDim,
      this.g,
      this.h,

      numVertices,
      numVertices == 0 ? 0 : this.pos0.ptr,
      numVertices == 0 ? 0 : this.vel0.ptr,
      vertexMass,

      ...this.muscles.toStepArgs(),

      ...this.triangles.toStepArgs(),

      this.friction.k,

      ...this.vertices.toStepArgs(),
    );
    
    if (numVertices != 0) {
      this.vertices.pos0.slot.f32().set(this.vertices.pos1.slot.f32());
      this.vertices.vel0.slot.f32().set(this.vertices.vel1.slot.f32());
    }
  }

  dispose() {
    this.vertices.dispose();
    this.muscles.dispose();
    this.triangles.dispose();
  }
}

module.exports = System;