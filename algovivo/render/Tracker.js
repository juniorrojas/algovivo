class Tracker {
  constructor(args = {}) {
    this.targetCenterX = null;
    this.currentCenterX = null;
    this.active = true;
    this.visibleWorldWidth = args.visibleWorldWidth ?? 3.8;
  }

  step(args = {}) {
    if (!this.active) return;
    
    const renderer = args.renderer;
    const camera = args.camera;
    const mesh = args.mesh;
    const floor = args.floor;
    const grid = args.grid;

    const meshCenter = mesh.computeCenter();
    const meshCenterX = meshCenter[0];

    if (!isNaN(meshCenterX)) this.targetCenterX = meshCenterX;

    if (this.currentCenterX == null) {
      this.currentCenterX = this.targetCenterX;
    } else {
      this.currentCenterX += (this.targetCenterX - this.currentCenterX) * 0.5;
    }

    const center = [this.currentCenterX, 1];
    camera.center({
      worldCenter: center,
      worldWidth: this.visibleWorldWidth,
      viewportWidth: renderer.width,
      viewportHeight: renderer.height,
    });

    const topRight = camera.domToWorldSpace([renderer.width, 0]);
    const bottomLeft = camera.domToWorldSpace([0, renderer.height]);

    const marginCells = 1
    
    const [_x0, _y0] = bottomLeft;
    const x0 = Math.floor(_x0) - marginCells;
    let y0 = Math.floor(_y0);
    if (y0 < 0) {
      y0 = 0;
    }
    const [_x1, _y1] = topRight;
    const x1 = _x1;
    const y1 = _y1;

    const width = x1 - x0;
    const height = y1 - y0;
    const rows = Math.ceil(height) + marginCells;
    const cols = Math.ceil(width) + marginCells;

    grid.set({
      x0: x0,
      y0: y0,
      rows: rows,
      cols: cols
    });

    floor.mesh.x = [
      [x0, 0],
      [x1, 0]
    ];
  }
}

module.exports = Tracker;