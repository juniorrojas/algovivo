class PointShader {
  constructor() {
  }

  renderPoint(args = {}) {
    const ctx = args.ctx;
    const p = args.p;
    
    const radius = 3;
    ctx.beginPath();
    ctx.arc(p[0], p[1], radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}

module.exports = PointShader;