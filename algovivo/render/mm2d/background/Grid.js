function makeGridData(args = {}) {
  const cellSize = (args.cellSize == null) ? 1 : args.cellSize;
  const innerDivs = (args.innerCells == null) ? 3 : args.innerCells;
  const rows = (args.rows == null) ? 3 : args.rows;
  const cols = (args.cols == null) ? 4 : args.cols;
  const x0 = (args.x0 == null) ? -2 : args.x0;
  const y0 = (args.y0 == null) ? 0 : args.y0;
  const primaryLineWidth = (args.primaryLineWidth == null) ? 0.022 : args.primaryLineWidth;
  const secondaryLineWidth = (args.secondaryLineWidth == null) ? 0.008 : args.secondaryLineWidth;

  const x = [];
  const lineIndices = [];
  const lineWidths = [];

  const y1 = y0 + rows * cellSize;
  const x1 = x0 + cols * cellSize;

  function makeLines(n, addVertices) {
    for (let i = 0; i < n + 1; i++) {
      const _innerDivs = (i == n) ? 1 : innerDivs;
      for (let i1 = 0; i1 < _innerDivs; i1++) {
        // why * 2? because every line creates 2 vertices
        const idx = lineIndices.length * 2;
        addVertices(i, i1, _innerDivs, x);
        lineIndices.push([idx, idx + 1]);
        if (i1 == 0) {
          lineWidths.push(primaryLineWidth);
        } else {
          lineWidths.push(secondaryLineWidth);
        }
      }
    }
  }

  // rows
  makeLines(rows, (i, i1, _innerDivs, x) => {
    const _y0 = y0 + i * cellSize;
    const _y1 = y0 + (i + 1) * cellSize;
    const t = i1 / _innerDivs;
    const _y = _y0 * (1 - t) + _y1 * t;
    x.push([x0, _y]);
    x.push([x1, _y]);
  });

  // columns
  makeLines(cols, (i, i1, _innerDivs, x) => {
    const _x0 = x0 + i * cellSize
    const _x1 = x0 + (i + 1) * cellSize
    const t = i1 / _innerDivs;
    const _x = _x0 * (1 - t) + _x1 * t;
    x.push([_x, y0]);
    x.push([_x, y1]);
  });

  return { x, lineIndices, lineWidths };
}

class Grid {
  constructor(args = {}) {
    if (args.scene == null) {
      throw new Error("scene required");
    }

    const color = (args.color == null) ? "rgba(0, 0, 0, 0.30)" : args.color;

    const mesh = this.mesh = args.scene.addMesh();

    this.set(args);
    
    mesh.setCustomAttribute("translation", [0, 0]);

    mesh.pointShader.renderPoint = () => {}

    mesh.lineShader.renderLine = Grid.makeGridLineShader({
      color: color
    });
  }

  get numVertices() {
    return this.mesh.x.length;
  }

  get numLines() {
    return this.mesh.lines.length;
  }

  set(args = {}) {
    const cellSize = (args.cellSize == null) ? 1 : args.cellSize;
    const innerCells = (args.innerCells == null) ? 3 : args.innerCells;
    const rows = (args.rows == null) ? 3 : args.rows;
    const cols = (args.cols == null) ? 4 : args.cols;
    const x0 = (args.x0 == null) ? -2 : args.x0;
    const y0 = (args.y0 == null) ? 0 : args.y0;
    const primaryLineWidth = (args.primaryLineWidth == null) ? 0.03 : args.primaryLineWidth;
    const secondaryLineWidth = (args.secondaryLineWidth == null) ? 0.008 : args.secondaryLineWidth;

    const mesh = this.mesh;

    const { x, lineIndices, lineWidths } = makeGridData({
      cellSize,
      innerCells,
      rows, cols,
      x0, y0,
      primaryLineWidth, secondaryLineWidth
    });
    mesh.pos = x;
    mesh.lines = lineIndices;
    mesh.setCustomAttribute("lineWidths", lineWidths);
  }

  static makeGridLineShader(args = {}) {
    const color = (args.color == null) ? "black" : args.color;
    return (args) => {
      const ctx = args.ctx;
      const a = args.a;
      const b = args.b;
      const camera = args.camera;
      const mesh = args.mesh;
      const scale = camera.inferScale();

      ctx.beginPath();
      ctx.strokeStyle = color;
      const lineWidths = mesh.getCustomAttribute("lineWidths");
      if (lineWidths == null) {
        throw new Error("custom attribute lineWidths missing");
      }
      const lineWidth = lineWidths[args.id];

      const _translation = mesh.getCustomAttribute("translation");
      const translation = [scale * _translation[0], scale * _translation[1]];

      ctx.lineWidth = lineWidth * scale;
      ctx.moveTo(a[0] + translation[0], a[1] + translation[1]);
      ctx.lineTo(b[0] + translation[0], b[1] + translation[1]);
      ctx.closePath();
      ctx.stroke();
    }
  }
}

module.exports = Grid;