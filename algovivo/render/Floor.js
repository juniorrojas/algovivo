import { defaultStyle } from "./style.js";

export default class Floor {
  constructor(args = {}) {
    if (args.scene == null) {
      throw new Error("scene required");
    }
    const scene = this.scene = args.scene;
    const mesh = this.mesh = scene.addMesh();
    mesh.pos = [
      [-10, 0],
      [10, 0]
    ];
    mesh.lines = [
      [0, 1]
    ];

    mesh.lineShader.renderLine = Floor.makeFloorLineShaderFunction({
      width: args.width,
      color: args.color
    });

    mesh.vertexShader.renderVertex = () => {};
  }

  static makeFloorLineShaderFunction(args = {}) {
    const width = args.width ?? defaultStyle.floor.width;
    const color = args.color ?? defaultStyle.borderColor;
    return (args) => {
      const ctx = args.ctx;
      const a = args.a;
      const b = args.b;
      const camera = args.camera;
      const scale = camera.inferScale();

      ctx.strokeStyle = color;
      ctx.lineWidth = scale * width;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }
  }
}
