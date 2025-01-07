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

class LineRenderer {
  constructor(args = {}) {
    this.system = args.system;
  }

  makeLineShaderFunction(args = {}) {
    const activeMuscleColor = args.activeMuscleColor ?? [255, 0, 0];
    const inactiveMuscleColor = args.inactiveMuscleColor ?? [0, 0, 255];
    const borderColor = args.borderColor ?? "black";
    
    return (args = {}) => {
      const ctx = args.ctx;
      const a = args.a;
      const b = args.b;
      const camera = args.camera;
      const scale = camera.inferScale();

      const lineIdToMuscleId = args.mesh.getCustomAttribute("lineIdToMuscleId");
      const muscleId = lineIdToMuscleId[args.id];
      if (muscleId == null) {
        const borderWidth = 0.029;
        renderLine(ctx, scale, a, b, borderWidth, borderColor);
      } else {
        const color0 = activeMuscleColor;
        const color1 = inactiveMuscleColor;
        
        const width = 0.065;
        const borderWidth = 0.017;
        const muscleIntensityAttributeName = "muscleIntensity";

        const muscleIntensity = args.mesh.getCustomAttribute(muscleIntensityAttributeName);
        if (muscleIntensity == null) {
          throw new Error(`muscle intensity attribute (${muscleIntensityAttributeName}) not found, call setCustomAttribute("${muscleIntensityAttributeName}", value) before rendering.`);
        }
        if (!Array.isArray(muscleIntensity)) {
          throw new Error(`muscle intensity attribute must be an array with values for each fiber, found ${typeof muscleIntensity}`);
        }
        
        const t = muscleIntensity[muscleId];
        renderMuscle(ctx, scale, a, b, t, width, borderWidth, borderColor, color0, color1);
      }
    }
  }
}

module.exports = LineRenderer;