const mm2d = require("./mm2d");

class ViewportVertices {
  constructor(args = {}) {
    this.system = args.system;
  }

  getVertexPos(i) {
    const pF32 = this.system.pos.slot.f32();
    const offset = i * 2;
    return [pF32[offset], pF32[offset + 1]];
  }

  get numVertices() {
    return this.system.numVertices;
  }

  hitTest(p, hitTestRadius = 0.31) {
    const numVertices = this.numVertices;
    if (numVertices == 0) return null;
    let closestVertexId = null;
    let closestQuadrance = Infinity;
    const hitTestRadius2 = hitTestRadius * hitTestRadius;
    for (let i = 0; i < numVertices; i++) {
      const pi = this.getVertexPos(i);
      const d = mm2d.math.Vec2.sub(pi, p);
      const q = mm2d.math.Vec2.quadrance(d);
      if (q < hitTestRadius2 && q < closestQuadrance) {
        closestVertexId = i;
        closestQuadrance = q;
      }
    }
    return closestVertexId;
  }
}

module.exports = ViewportVertices;