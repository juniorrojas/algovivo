import { AABB, Vec2 } from "../math/index.js";
import { PointShader, LineShader, TriangleShader } from "../shaders/index.js";

export default class Mesh {
  constructor(args = {}) {
    this.scene = args.scene;
    this.id = args.id;

    this.x = [];
    this.triangles = [];
    this.lines = [];

    this.pointShader = new PointShader({});
    this.lineShader = new LineShader({});
    this.triangleShader = new TriangleShader({});

    this.customAttributes = {};
  }

  get pos() { return this.x; }
  set pos(x) { this.x = x; }

  numVertices() {
    return this.pos.length;
  }

  numTriangles() {
    return this.triangles.length;
  }

  numLines() {
    return this.lines.length;
  }

  setCustomAttribute(key, value) {
    this.customAttributes[key] = value;
  }

  getCustomAttribute(key) {
    return this.customAttributes[key];
  }

  computeAABB() {
    let minX = null;
    let maxX = null;
    let minY = null;
    let maxY = null;
    this.pos.forEach((pi) => {
      const x = pi[0];
      const y = pi[1];
      if (minX == null || x < minX) minX = x;
      if (maxX == null || x > maxX) maxX = x;
      if (minY == null || y < minY) minY = y;
      if (maxY == null || y > maxY) maxY = y;
    });
    return new AABB({
      x0: minX,
      y0: minY,
      x1: maxX,
      y1: maxY
    });
  }

  computeCenter() {
    const numVertices = this.pos.length;
    if (numVertices == 0) {
      throw new Error("no vertices to compute center");
    }

    let center = [0, 0];
    for (let i = 0; i < numVertices; i++) {
      const xi = this.pos[i];
      Vec2.add_(center, xi);
    }
    Vec2.mulScalar_(center, 1 / numVertices);
    return center;
  }
}
