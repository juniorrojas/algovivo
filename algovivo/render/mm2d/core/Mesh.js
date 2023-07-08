const math = require("../math");
const shaders = require("../shaders");

class Mesh {
  constructor(args = {}) {
    // if (args.scene == null) throw new Error("scene required");
    // if (args.id == null) throw new Error("id required");
    this.scene = args.scene;
    this.id = args.id;
    
    this.x = [];
    this.triangles = [];
    this.lines = [];

    this.pointShader = new shaders.PointShader({});
    this.lineShader = new shaders.LineShader({});
    this.triangleShader = new shaders.TriangleShader({});

    this.customAttributes = {};
  }

  numVertices() {
    return this.x.length;
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
    this.x.forEach((xi) => {
      const x = xi[0];
      const y = xi[1];
      if (minX == null || x < minX) minX = x;
      if (maxX == null || x > maxX) maxX = x;
      if (minY == null || y < minY) minY = y;
      if (maxY == null || y > maxY) maxY = y;
    });
  return new math.AABB({
      x0: minX,
      y0: minY,
      x1: maxX,
      y1: maxY
    });
  }

  computeCenter() {
    let center = [0, 0];
    const numVertices = this.x.length;
    for (let i = 0; i < numVertices; i++) {
      const xi = this.x[i];
      math.Vec2.add_(center, xi);
    }
    math.Vec2.mulScalar_(center, 1 / numVertices);
    return center;
  }
}

module.exports = Mesh;