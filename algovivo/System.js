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

  set(data) {
    const ten = this.ten;
    
    const numVertices = data.x.length;

    const mgr = this.memoryManager;

    this.setX(data.x);
    
    // const r = ten.zeros([numVertices]);
    // if (this.r != null) this.r.dispose();
    // this.r = r;
    this.r = null;
    
    let numTriangles;
    if (data.triangles == null) numTriangles = 0;
    else numTriangles = data.triangles.length;
    
    const triangles = mgr.malloc32(numTriangles * 3);
    if (this.triangles != null) this.triangles.free();
    this.triangles = triangles;
    if (data.triangles != null) {
      data.triangles.forEach((t, i) => {
        triangles.u32()[i * 3]     = t[0];
        triangles.u32()[i * 3 + 1] = t[1];
        triangles.u32()[i * 3 + 2] = t[2];
      });
    }

    let edges;

    if (data.springs == null) {
      edges = [];
    } else {
      edges = data.springs;
    }
    
    const numSprings = edges.length;
    const springs = mgr.malloc32(numSprings * 2);

    edges.forEach((e, i) => {
      springs.u32()[i * 2] = e[0];
      springs.u32()[i * 2 + 1] = e[1];
    });
    
    if (this.springs != null) this.springs.free();
    this.springs = springs;

    const a = ten.zeros([numSprings]);
    if (this.a != null) this.a.dispose();
    this.a = a;

    const l0 = ten.zeros([numSprings]);
    if (this.l0 != null) this.l0.dispose();
    this.l0 = l0;
    if (data.springsL0 == null) {
      for (let i = 0; i < numSprings; i++) {
        a.slot.f32()[i] = 1;
        // TODO use WASM l0_of_x
        const [i1, i2] = edges[i];
        const p1 = data.x[i1];
        const p2 = data.x[i2]
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const q = dx * dx + dy * dy;
        const l0i = Math.sqrt(q);
        l0.slot.f32()[i] = l0i;
      }
    } else {
      for (let i = 0; i < numSprings; i++) {
        a.slot.f32()[i] = 1;
        const l0i = data.springsL0[i];
        l0.slot.f32()[i] = l0i;
      }
    }

    const rsi = ten.zeros([
      numTriangles, 2, 2
    ]);
    if (this.rsi != null) this.rsi.dispose();
    this.rsi = rsi;
    
    const rsiF32 = rsi.slot.f32();
    if (data.trianglesRsi == null) {
      for (let i = 0; i < numTriangles; i++) {
        const triangle = data.triangles[i];
        const a = data.x[triangle[0]];
        const b = data.x[triangle[1]];
        const c = data.x[triangle[2]];
        const abx = b[0] - a[0];
        const aby = b[1] - a[1];
        const acx = c[0] - a[0];
        const acy = c[1] - a[1];
        // const restShape = [
        //   [abx, acx],
        //   [aby, acy]
        // ];
        const d = abx * acy - acx * aby;
        const offset = i * 4;
        rsiF32[offset] = acy / d;
        rsiF32[offset + 1] = -acx / d;
        rsiF32[offset + 2] = -aby / d;
        rsiF32[offset + 3] = abx / d;
      }
    } else {
      for (let i = 0; i < numTriangles; i++) {
        const rsi1 = data.trianglesRsi[i];
        const offset = i * 4;
        rsiF32[offset    ] = rsi1[0][0];
        rsiF32[offset + 1] = rsi1[0][1];
        rsiF32[offset + 2] = rsi1[1][0];
        rsiF32[offset + 3] = rsi1[1][1];
      }
    }
  }

  backwardEulerLoss() {
    const wasmInstance = this.wasmInstance;
    return wasmInstance.exports.be_loss(
      this.numVertices(),
      this.x0.ptr, this.x0.ptr,
      this.v0.ptr,

      this.h,
      0,

      this.numSprings(),
      this.springs.ptr,

      this.numTriangles(),
      this.triangles.ptr,
      this.rsi.ptr,

      this.a.ptr,
      this.l0.ptr
    );
  }

  updateTmpBuffers() {
    if (this.x0 == null) {
      throw new Error("x0 required");
    }
    const numVertices = this.numVertices();
    const spaceDim = 2;
    const ten = this.ten;
    
    // TODO only allocate new memory if necessary
    const xGrad = ten.zeros([numVertices, spaceDim]);
    if (this.xGrad != null) this.xGrad.dispose();
    this.xGrad = xGrad;

    const xTmp =ten.zeros([numVertices, spaceDim]);
    if (this.xTmp != null) this.xTmp.dispose();
    this.xTmp = xTmp;
  }

  step() {
    const numVertices = this.numVertices();
    const numSprings = this.numSprings();
    const numTriangles = this.numTriangles();

    const fixedVertexId = this.fixedVertexId;

    this.wasmInstance.exports.be_step(
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
    if (this.x0 != null) this.x0.dispose();
    if (this.x1 != null) this.x1.dispose();
    if (this.xGrad != null) this.xGrad.dispose();
    if (this.xTmp != null) this.xTmp.dispose();
    if (this.v0 != null) this.v0.dispose();
    if (this.v1 != null) this.v1.dispose();

    if (this.triangles != null) this.triangles.free();
    if (this.rsi != null) this.rsi.dispose();

    if (this.springs != null) this.springs.free();
    if (this.l0 != null) this.l0.dispose();
    if (this.a != null) this.a.dispose();
  }
}

module.exports = System;