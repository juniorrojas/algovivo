class LineShader {
  constructor() {
  }

  renderLine(args = {}) {
    const ctx = args.ctx;
    const a = args.a;
    const b = args.b;
    
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 5;
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.closePath();
    ctx.stroke();
  }
}

module.exports = LineShader;