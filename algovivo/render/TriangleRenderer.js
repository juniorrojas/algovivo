class TriangleRenderer {
  constructor(args = {}) { 
    this.fillColor = args.fillColor ?? "white";
  }

  renderTriangle(args = {}) {
    const ctx = args.ctx;
    const a = args.a;
    const b = args.b;
    const c = args.c;

    ctx.beginPath();
    ctx.fillStyle = this.fillColor;
    ctx.moveTo(...a);
    ctx.lineTo(...b);
    ctx.lineTo(...c);
    ctx.closePath();
    ctx.fill();
  }
}

module.exports = TriangleRenderer;