class AABB {
  constructor(args = {}) {
    if (args.x0 == null) throw new Error("x0 required");
    if (args.y0 == null) throw new Error("y0 required");
    this._x0 = args.x0;
    this._y0 = args.y0;

    let x1 = null;
    if (args.width != null) {
      x1 = this._x0 + args.width
    } else {
      if (args.x1 == null) throw new Error("x1 required");
      x1 = args.x1;
    }
    this._x1 = x1;

    let y1 = null;
    if (args.height != null) {
      y1 = this._y0 + args.height
    } else {
      if (args.y1 == null) throw new Error("y1 required");
      y1 = args.y1;
    }
    this._y1 = y1;
  }

  x0() { return this._x0; }
  x1() { return this._x1; }
  y0() { return this._y0; }
  y1() { return this._y1; }

  center() {
    return [
      (this.x0 + this.x1) * 0.5,
      (this.y0 + this.y1) * 0.5
    ];
  }
}

module.exports = AABB;