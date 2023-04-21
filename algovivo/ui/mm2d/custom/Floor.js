class Floor {
  constructor(args = {}) {
    if (args.scene == null) {
      throw new Error("scene required");
    }
    const scene = this.scene = args.scene;
    const mesh = this.mesh = scene.addMesh();
    mesh.x = [
      [-10, 0],
      [10, 0]
    ];
    mesh.lines = [
      [0, 1]
    ];

    mesh.lineShader.renderLine = Floor.makeFloorLineShader({
      width: args.width
    });

    mesh.setCustomAttribute("translation", [0, 0]);
  }

  static makeFloorLineShader(args = {}) {
    const width = (args.width == null) ? 0.055 : args.width;
    return (args) => {
      const ctx = args.ctx;
      const a = args.a;
      const b = args.b;
      const camera = args.camera;
      const mesh = args.mesh;
      const scale = camera.inferScale();

      const _translation = mesh.getCustomAttribute("translation");
      const translation = [scale * _translation[0], scale * _translation[1]];

      ctx.strokeStyle = "black";
      ctx.lineWidth = scale * width;
      ctx.beginPath();
      ctx.moveTo(a[0] + translation[0], a[1] + translation[1]);
      ctx.lineTo(b[0] + translation[0], b[1] + translation[1]);
      ctx.stroke();
    }
  }
}

module.exports = Floor;