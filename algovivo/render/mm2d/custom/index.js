const Floor = require("./Floor");

function makePointShader(args = {}) {
  const radius = (args.radius == null) ? 0.028 : args.radius;
  const borderColor = (args.borderColor == null) ? "black" : args.borderColor;
  const fillColor = (args.fillColor == null) ? "white" : args.fillColor;
  const borderWidth = (args.borderWidth == null) ? 0.023 : args.borderWidth;

  return (args) => {
    const ctx = args.ctx;
    const p = args.p;
    const camera = args.camera;
    const scale = camera.inferScale();
    
    const radius1 = (radius + borderWidth) * scale;
    ctx.fillStyle = borderColor;
    ctx.beginPath();
    ctx.arc(p[0], p[1], radius1, 0, 2 * Math.PI);
    ctx.fill();

    const radius2 = radius * scale;
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(p[0], p[1], radius2, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function makeFloorShader(args = {}) {
  // TODO parameterize
  const color = "black";
  const width = 0.055;
  return (args) => {
    const ctx = args.ctx;
    const a = args.a;
    const b = args.b;
    const camera = args.camera;
    const scale = camera.inferScale();

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineWidth = width * scale;
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.closePath();
    ctx.stroke();
  }
}

module.exports = {
  makePointShader: makePointShader,
  makeFloorShader: makeFloorShader,
  Floor: Floor
};