class Vertices {
  constructor(args = {}) {
    const ten = args.ten;
    if (ten == null) throw new Error("ten required");
    this.ten = ten;

    const spaceDim = this.spaceDim = args.spaceDim;
    if (spaceDim == null) throw new Error("spaceDim required");

    this.vertexMass = args.vertexMass ?? 6.0714287757873535;

    this.pos0 = null;
    this.pos1 = null;
    this.vel0 = null;
    this.vel1 = null;

    this.posGrad = null;
    this.posTmp = null;

    this._fixedVertexId = -1;
  }

  getVertexPos(i) {
    const pos = [];
    for (let j = 0; j < this.spaceDim; j++) {
      pos.push(this.pos.get([i, j]));
    }
    return pos;
  }

  set fixedVertexId(value) {
    throw new Error("use fixVertex instead");
  }

  get fixedVertexId() {
    return this._fixedVertexId;
  }

  fixVertex(vertexId) {
    this._fixedVertexId = vertexId;
  }

  freeVertex() {
    this._fixedVertexId = -1;
  }

  get pos() {
    return this.pos0;
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
  }
}

module.exports = Vertices;