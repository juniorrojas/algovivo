class Matrix2x2 {
  constructor(m00, m01, m10, m11) {
    this.m00 = m00;
    this.m01 = m01;
    this.m10 = m10;
    this.m11 = m11;
  }

  get(i, j) {
    return this[`m${i}${j}`];
  }

  set(m00, m01,
      m10, m11) {
    this.m00 = m00;
    this.m01 = m01;
    this.m10 = m10;
    this.m11 = m11;
  }

  toArray() {
    return [
      [this.m00, this.m01],
      [this.m10, this.m11]
    ];
  }

  negate() {
    return new Matrix2x2(
      -this.m00, -this.m01,
      -this.m10, -this.m11
    );
  }

  apply(v) {
    return [
      this.m00 * v[0] + this.m01 * v[1],
      this.m10 * v[0] + this.m11 * v[1]
    ];
  }

  det() {
    return this.m00 * this.m11 - this.m10 * this.m01;
  }

  inv() {
    const det = this.det();
    return new Matrix2x2(
       this.m11 / det, -this.m01 / det,
      -this.m10 / det,  this.m00 / det
    );
  }

  mm(b) {
    const a00 = this.m00;
    const a01 = this.m01;
    const a10 = this.m10;
    const a11 = this.m11;

    const b00 = b.m00;
    const b01 = b.m01;
    const b10 = b.m10;
    const b11 = b.m11;

    return new Matrix2x2(
      a00 * b00 + a01 * b10, a00 * b01 + a01 * b11,
      a10 * b00 + a11 * b10, a10 * b01 + a11 * b11
    );
  }

  t() {
    return new Matrix2x2(
      this.m00, this.m10,
      this.m01, this.m11
    );
  }

  static fromArray(a) {
    return new Matrix2x2(
      a[0][0], a[0][1],
      a[1][0], a[1][1]
    );
  }
}

module.exports = Matrix2x2;