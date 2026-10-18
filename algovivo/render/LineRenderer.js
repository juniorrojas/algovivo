import { defaultStyle } from "./style.js";

function hashSimplex(vids) {
  return [...vids].sort().join("_");
}

function renderLine(ctx, scale, a, b, borderWidth, borderColor) {
  ctx.beginPath();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth * scale;
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.closePath();
  ctx.stroke();
}

function renderMuscle(ctx, scale, a, b, t, width, borderWidth, borderColor, color0, color1) {
  ctx.beginPath();
  ctx.lineCap = "butt";
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = (width + borderWidth * 2) * scale;
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();

  ctx.beginPath();

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
  ctx.lineWidth = width * scale;
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);

  ctx.stroke();
}

export default class LineRenderer {
  constructor(args = {}) {
    this.system = args.system;
    this.lineIdToMuscleId = null;
    this.muscleIntensity = null;
  }

  makeEdgesFromTriangles(triangles) {
    const edges = new Map();

  function addEdge(i1, i2) {
    const hash = hashSimplex([i1, i2]);
      edges.set(hash, [i1, i2]);
    }

    triangles.forEach(t => {
      addEdge(t[0], t[1]);
      addEdge(t[1], t[2]);
      addEdge(t[0], t[2]);
    });
    return Array.from(edges.values());
  }

  makeLineShaderFunction(args = {}) {
    const activeMuscleColor = args.activeMuscleColor ?? defaultStyle.muscle.activeColor;
    const inactiveMuscleColor = args.inactiveMuscleColor ?? defaultStyle.muscle.inactiveColor;
    const borderColor = args.borderColor ?? defaultStyle.borderColor;
    const edgeWidth = args.edgeWidth ?? defaultStyle.edge.width;
    const muscleWidth = args.muscleWidth ?? defaultStyle.muscle.width;
    const muscleBorderWidth = args.muscleBorderWidth ?? defaultStyle.muscle.borderWidth;

    return (args = {}) => {
      const ctx = args.ctx;
      const a = args.a;
      const b = args.b;
      const camera = args.camera;
      const scale = camera.inferScale();

      const lineIdToMuscleId = this.lineIdToMuscleId;
      let muscleId = null;
      if (lineIdToMuscleId != null) {
        muscleId = lineIdToMuscleId[args.id];
      }
      if (muscleId == null) {
        renderLine(ctx, scale, a, b, edgeWidth, borderColor);
      } else {
        const color0 = activeMuscleColor;
        const color1 = inactiveMuscleColor;

        const muscleIntensity = this.muscleIntensity;
        if (muscleIntensity == null) {
          throw new Error("muscle intensity not found, set muscleIntensity before rendering.");
        }
        if (!Array.isArray(muscleIntensity)) {
          throw new Error(`muscle intensity must be an array with values for each fiber, found ${typeof muscleIntensity}`);
        }

        const t = muscleIntensity[muscleId];
        renderMuscle(ctx, scale, a, b, t, muscleWidth, muscleBorderWidth, borderColor, color0, color1);
      }
    }
  }
}
