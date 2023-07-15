class Tracker {
  constructor() {
    this.targetCenterX = null;
    this.currentCenterX = null;
  }

  step(args = {}) {
    const renderer = args.renderer;
    const camera = args.camera;
    const mesh = args.mesh;
    const floor = args.floor;
    const grid = args.grid;

    const meshCenter = mesh.computeCenter();
    const meshCenterX = meshCenter[0];

    this.targetCenterX = meshCenterX;

    if (this.currentCenterX == null) {
      this.currentCenterX = this.targetCenterX;
    } else {
      this.currentCenterX += (this.targetCenterX - this.currentCenterX) * 0.5;
    }

    const recenterThreshold = 3;
    const cx = this.currentCenterX;
    const tx = Math.floor(cx / recenterThreshold) * recenterThreshold;
    grid.mesh.setCustomAttribute(
      "translation",
      [tx, 0]
    );
    floor.mesh.setCustomAttribute(
      "translation",
      [tx, 0]
    );

    const center = [this.currentCenterX, 1];
    camera.center({
      worldCenter: center,
      worldWidth: 3.8,
      viewportWidth: renderer.width,
      viewportHeight: renderer.height,
    });
  }
}

module.exports = Tracker;