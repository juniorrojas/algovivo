class Background {
  constructor(args = {}) {
    if (args.scene == null) {
      throw new Error("scene required");
    }
    const mesh = this.mesh = args.scene.addMesh();
    mesh.x = [[0, 0]];
    
    const color1 = (args.color1 == null) ? "#fcfcfc" : args.color1;
    const color2 = (args.color2 == null) ? "#d7d8d8" : args.color2;
    mesh.pointShader.renderPoint = (args = {}) => {
      const width = args.renderer.width;
      const height = args.renderer.height;
      const ctx = args.ctx;

      const grd = ctx.createRadialGradient(
        width * 0.5, height * 0.5, width * 0.05,
        width * 0.5, height * 0.5, width * 0.5
      );
      grd.addColorStop(0, color1);
      grd.addColorStop(1, color2);
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);
    }
  }
}

module.exports = Background;