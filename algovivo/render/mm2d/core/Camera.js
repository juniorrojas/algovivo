const math = require("../math");

class Camera {
  constructor() {
    this.transform = new math.Transform2d();
  }

  domToWorldSpace(pos) {
    if (!Array.isArray(pos)) throw new Error(`array expected, found ${typeof pos}`);
    if (pos.length != 2) throw new Error(`array with 2 elements expected, found ${pos.length}`);
    const worldPos = this.transform.inv().apply(pos);
    return worldPos;
  }

  inferScale() {
    return this.transform.inferScale();
  }

  center(args = {}) {
    let scale = args.zoom ?? 1;
    
    let viewportWidth = args.viewportWidth;
    let viewportHeight = args.viewportHeight;
    if (args.renderer != null) {
      // if present, args.renderer overwrites
      // viewportWidth and viewportHeight
      viewportWidth = args.renderer.width;
      viewportHeight = args.renderer.height;
    }

    if (viewportWidth == null) {
      throw new Error("viewportWidth required");
    }
    if (viewportHeight == null) {
      throw new Error("viewportHeight required");
    }

    if (args.worldWidth != null) {
      if (viewportWidth == null) {
        throw new Error("viewportWidth required");
      }
      scale = viewportWidth / args.worldWidth;
    }
    
    this.transform.linear = new math.Matrix2x2(
      scale, 0,
      0, -scale
    );

    let translation;
    if (args.worldCenter != null) {
      const worldCenter = args.worldCenter;
      translation = [
        viewportWidth * 0.5 - worldCenter[0] * scale,
        viewportHeight * 0.5 + worldCenter[1] * scale
      ]
    } else {
      translation = [
        viewportWidth * 0.5,
        viewportHeight * 0.5
      ]
    }
    this.transform.translation = translation;
  }
}

module.exports = Camera;