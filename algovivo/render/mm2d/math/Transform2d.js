import Matrix2x2 from "./Matrix2x2.js";
import * as Vec2 from "./Vec2.js";

export default class Transform2d {
  constructor() {
    this.translation = [0, 0];
    this.linear = new Matrix2x2(
      1, 0,
      0, 1
    );
  }

  inferScale() {
    const sx = this.linear.m00;
    return sx;
  }

  apply(v) {
    return Vec2.add(this.linear.apply(v), this.translation);
  }

  inv() {
    const inv = new Transform2d();
    inv.linear = this.linear.inv();
    inv.translation = inv.linear.negate().apply(this.translation);
    return inv;
  }

  toColumnMajorArray() {
    return [
      this.linear.get(0, 0),
      this.linear.get(1, 0),
      this.linear.get(0, 1),
      this.linear.get(1, 1),
      this.translation[0],
      this.translation[1],
    ];
  }
}
