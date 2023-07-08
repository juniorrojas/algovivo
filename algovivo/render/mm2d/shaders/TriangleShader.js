class TriangleShader {
  constructor() {
  }

  renderTriangle(args = {}) {
    const ctx = args.ctx;
    const a = args.a;
    const b = args.b;
    const c = args.c;
    
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.lineTo(c[0], c[1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

module.exports = TriangleShader;