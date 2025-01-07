const mm2d = require("./mm2d");

function renderCircle(ctx, scale, p, radius, borderWidth, borderColor, fillColor) {
  const radius1 = (radius + borderWidth * 0.5) * scale;

  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.arc(p[0], p[1], radius1, 0, 2 * Math.PI);
  ctx.fill();

  ctx.lineWidth = borderWidth * scale;
  ctx.strokeStyle = borderColor;
  ctx.stroke();
}

class VertexRenderer {
  constructor(args = {}) {
    this.system = args.system;
    this.renderVertexIds = args.renderVertexIds ?? false;
  }

  makePointShaderFunction(args = {}) {
    const radius = args.radius ?? 0.028;
    const borderColor = args.borderColor ?? "black";
    const fillColor = args.fillColor ?? "white";
    const borderWidth = args.borderWidth ?? 0.023;
  
    return (args) => {
      const ctx = args.ctx;
      const p = args.p;
      const camera = args.camera;
      const scale = camera.inferScale();
      
      renderCircle(ctx, scale, p, radius, borderWidth, borderColor, fillColor);

      if (this.renderVertexIds) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.arc(p[0], p[1], 0.1 * scale, 0, 2 * Math.PI);
        ctx.fill();
        
        const fontSize = Math.floor(0.15 * scale);
        ctx.font = `${fontSize}px monospace`;
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(args.id, p[0], p[1]);
      }
    }
  }

  getVertexPos(i) {
    const pF32 = this.system.pos.slot.f32();
    const offset = i * this.system.spaceDim;
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

  setVertexPos(i, p) {
    if (i == null) throw new Error("vertex id required");
    const system = this.system;
    const pF32 = system.pos.slot.f32();
    const offset = i * 2;
    pF32[offset] = p[0];
    pF32[offset + 1] = p[1];
  }

  setVertexVel(i, v) {
    const system = this.system;
    const vF32 = system.vel.slot.f32();
    const offset = i * 2;
    vF32[offset] = v[0];
    vF32[offset + 1] = v[1];
  }
}

module.exports = VertexRenderer;