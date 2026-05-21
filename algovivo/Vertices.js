export default class Vertices {
  constructor(args = {}) {
    const ten = args.ten;
    if (ten == null) throw new Error("ten required");
    this.ten = ten;

    this.spaceDim = args.spaceDim ?? 2;

    this.vertexMass = args.vertexMass ?? 6.0714287757873535;

    this.pos0 = null;
    this.pos1 = null;
    this.vel0 = null;
    this.vel1 = null;

    this.posGrad = null;
    this.posTmp = null;

    this._fixedVertexIds = null;
  }

  toStepArgs() {
    const numVertices = this.numVertices;
    const vertexMass = this.vertexMass;
    const numFixedVertices = this.numFixedVertices;

    return [
      numVertices,
      numVertices == 0 ? 0 : this.pos0.ptr,
      numVertices == 0 ? 0 : this.vel0.ptr,
      vertexMass,

      numFixedVertices,
      numFixedVertices == 0 ? 0 : this._fixedVertexIds.ptr,

      numVertices == 0 ? 0 : this.pos1.ptr,
      numVertices == 0 ? 0 : this.posGrad.ptr,
      numVertices == 0 ? 0 : this.posTmp.ptr,
      numVertices == 0 ? 0 : this.vel1.ptr,
    ];
  }

  setVertexPos(i, pos) {
    for (let j = 0; j < this.spaceDim; j++) {
      this.pos.set([i, j], pos[j]);
    }
  }

  getVertexPos(i) {
    const pos = [];
    for (let j = 0; j < this.spaceDim; j++) {
      pos.push(this.pos.get([i, j]));
    }
    return pos;
  }

  get numFixedVertices() {
    if (this._fixedVertexIds == null) return 0;
    return this._fixedVertexIds.shape.get(0);
  }

  get fixedVertexIds() {
    if (this._fixedVertexIds == null) return [];
    return Array.from(this._fixedVertexIds.typedArray());
  }

  get fixedVertexId() {
    const ids = this.fixedVertexIds;
    if (ids.length == 0) return -1;
    return ids[0];
  }

  fixVertices(vertexIds) {
    if (this._fixedVertexIds != null) {
      this._fixedVertexIds.dispose();
      this._fixedVertexIds = null;
    }
    if (vertexIds == null || vertexIds.length == 0) return;
    this._fixedVertexIds = this.ten.zeros([vertexIds.length], "int32");
    this._fixedVertexIds.typedArray().set(vertexIds);
  }

  fixVertex(vertexId) {
    this.fixVertices([vertexId]);
  }

  freeVertices() {
    this.fixVertices([]);
  }

  freeVertex() {
    this.freeVertices();
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

  get wasmInstance() {
    return this.ten.wasmInstance;
  }

  get memoryManager() {
    return this.ten.mgr;
  }

  set(pos) {
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

  addVertex(args = {}) {
    const ten = this.ten;
    const numVertices0 = this.numVertices;
    const spaceDim = this.spaceDim;

    const pos0 = ten.empty([numVertices0 + 1, spaceDim]);
    const vel0 = ten.empty([numVertices0 + 1, spaceDim]);
    const pos1 = ten.empty([numVertices0 + 1, spaceDim]);
    const vel1 = ten.empty([numVertices0 + 1, spaceDim]);

    for (let i = 0; i < numVertices0; i++) {
      for (let j = 0; j < spaceDim; j++) {
        pos0.set([i, j], this.pos0.get([i, j]));
        vel0.set([i, j], this.vel0.get([i, j]));
        pos1.set([i, j], this.pos1.get([i, j]));
        vel1.set([i, j], this.vel1.get([i, j]));
      }
    }

    const pi = args.pos ?? [0, 0];
    const vi = args.vel ?? [0, 0];
    for (let j = 0; j < spaceDim; j++) {
      pos0.set([numVertices0, j], pi[j]);
      pos1.set([numVertices0, j], pi[j]);
      vel0.set([numVertices0, j], vi[j]);
      vel1.set([numVertices0, j], vi[j]);
    }

    if (this.pos0 != null) this.pos0.dispose();
    this.pos0 = pos0;

    if (this.vel0 != null) this.vel0.dispose();
    this.vel0 = vel0;

    if (this.pos1 != null) this.pos1.dispose();
    this.pos1 = pos1;

    if (this.vel1 != null) this.vel1.dispose();
    this.vel1 = vel1;

    this.updateTmpBuffers();
  }

  dispose() {
    if (this._fixedVertexIds != null) {
      this._fixedVertexIds.dispose();
      this._fixedVertexIds = null;
    }
    if (this.pos0 != null) {
      this.pos0.dispose();
      this.pos0 = null;
    }
    if (this.pos1 != null) {
      this.pos1.dispose();
      this.pos1 = null;
    }
    if (this.vel0 != null) {
      this.vel0.dispose();
      this.vel0 = null;
    }
    if (this.vel1 != null) {
      this.vel1.dispose();
      this.vel1 = null;
    }
    if (this.posGrad != null) {
      this.posGrad.dispose();
      this.posGrad = null;
    }
    if (this.posTmp != null) {
      this.posTmp.dispose();
      this.posTmp = null;
    }
  }
}
