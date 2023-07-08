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

function makeFiberShader(args = {}) {
  const color0 = (args.color0 == null) ? [255, 0, 0] : args.color0;
  const color1 = (args.color1 == null) ? [250, 190, 190] : args.color1;
  const width = (args.width == null) ? 0.065 : args.width;
  const borderWidth = (args.borderWidth == null) ? 0.017 : args.borderWidth;
  const borderColor = (args.borderColor == null) ? "black" : args.borderColor;
  const lineCap = (args.lineCap == null) ? "butt" : args.lineCap;
  const muscleIntensityAttributeName = (args.muscleIntensityAttributeName == null) ? "muscleIntensity" : args.muscleIntensityAttributeName;
  return (args) => {
    const ctx = args.ctx;
    const a = args.a;
    const b = args.b;
    const mesh = args.mesh;
    const camera = args.camera;
    const scale = camera.inferScale();

    ctx.beginPath();
    ctx.lineCap = lineCap;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = (width + borderWidth * 2) * scale;
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();

    ctx.beginPath();

    const muscleIntensity = mesh.getCustomAttribute(muscleIntensityAttributeName);
    if (muscleIntensity == null) {
      throw new Error(`muscle intensity attribute (${muscleIntensityAttributeName}) not found, call setCustomAttribute("${muscleIntensityAttributeName}", value) before rendering.`);
    }
    if (!Array.isArray(muscleIntensity)) {
      throw new Error(`muscle intensity attribute must be an array with values for each fiber, found ${typeof muscleIntensity}`);
    }
    const numLines = mesh.lines.length;
    if (muscleIntensity.length != numLines) {
      throw new Error(`expected ${numLines} values in muscle intensity attribute, found ${muscleIntensity.length}`);
    }
    const t = muscleIntensity[args.id];
    
    const cr0 = color0[0];
    const cr1 = color1[0];

    const cg0 = color0[1];
    const cg1 = color1[1];

    const cb0 = color0[2];
    const cb1 = color1[2];

    const cr = (1 - t) * cr0 + t * cr1;
    const cg = (1 - t) * cg0 + t * cg1;
    const cb = (1 - t) * cb0 + t * cb1;

    ctx.strokeStyle = `rgb(${cr}, ${cg}, ${cb})`;
    ctx.lineCap = lineCap;
    ctx.lineWidth = width * scale;
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);

    ctx.stroke();
  }
}

function makeTriangleShader(args = {}) {
  const borderWidth = (args.borderWidth == null) ? 0.029 : args.borderWidth;
  const borderColor = (args.borderColor == null) ? "black" : args.borderColor;
  const fillColor = (args.fillColor == null) ? "white" : args.fillColor;
  return (args) => {
    const ctx = args.ctx;
    const a = args.a;
    const b = args.b;
    const c = args.c;
    const camera = args.camera;
    const scale = camera.inferScale();

    ctx.beginPath();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = (borderWidth * 2) * scale;
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.lineTo(c[0], c[1]);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.fillStyle = fillColor;
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.lineTo(c[0], c[1]);
    ctx.closePath();
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
  makeFiberShader: makeFiberShader,
  makeTriangleShader: makeTriangleShader,
  makeFloorShader: makeFloorShader,
  Floor: Floor
};