const minInPageHeight = 300;
const maxInPageHeight = 460;
const visibleWorldHeight = maxInPageHeight * 3.4 / 400;

export default class AgentViewport {
  constructor(args = {}) {
    if (args.algovivo == null) throw new Error("algovivo required");
    if (args.system == null) throw new Error("system required");
    this.system = args.system;

    this.fullscreen = false;
    this.overlayFractionRight = 0;
    this.reservedBottom = 0;
    this.onResize = null;
    this.width = null;
    this.height = null;

    const div = this.domElement = document.createElement("div");
    div.style.position = "relative";
    div.style.display = "block";
    div.style.width = "100%";
    div.style.overflow = "hidden";

    this.viewport = new args.algovivo.render.SystemViewport({
      system: this.system,
      domElementForMoveEvents: div
    });
    div.appendChild(this.viewport.domElement);

    this.resizeObserver = new ResizeObserver(() => this.updateSize());
    this.resizeObserver.observe(div);
  }

  setMesh(mesh) {
    const viewport = this.viewport;
    viewport.needsMeshUpdate = true;
    if (mesh.depth != null) {
      viewport.setSortedVertexIdsFromVertexDepths(mesh.depth);
    } else {
      viewport.sortedVertexIds = mesh.sorted_vertex_ids ?? null;
    }
  }

  updateSize(force = false) {
    const width = this.domElement.clientWidth;
    if (width == 0) return;
    const height = this.fullscreen
      ? window.innerHeight
      : Math.max(minInPageHeight, Math.min(maxInPageHeight, Math.round(width * 0.55)));

    if (height != this.height) this.domElement.style.height = `${height}px`;
    const changed = width != this.width || height != this.height;
    this.width = width;
    this.height = height;
    if (!changed && !force) return;

    if (this.onResize != null) this.onResize({ width, height });

    this.viewport.setSize({ width, height });

    const worldWidth = visibleWorldHeight * Math.max(1, width / height);
    const scale = width / worldWidth;
    const worldHeight = height / scale;

    const tracker = this.viewport.tracker;
    tracker.visibleWorldWidth = worldWidth;
    tracker.offsetX = 0.5 * this.overlayFractionRight * worldWidth;
    tracker.targetCenterY = Math.min(
      1,
      worldHeight / 2 - this.reservedBottom / scale
    );

    this.render();
  }

  render() {
    if (this.system.numVertices == 0) return;
    this.viewport.render();
  }
}
