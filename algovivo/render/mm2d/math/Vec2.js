function clone(a) {
  return [a[0], a[1]];
}

function add(a, b) {
  return [
    a[0] + b[0],
    a[1] + b[1]
  ];
}

function add_(a, b) {
  a[0] += b[0];
  a[1] += b[1];
}

function mulScalar_(a, c) {
  a[0] *= c;
  a[1] *= c;
}

function mulScalar(a, c) {
  const ca = clone(a);
  mulScalar_(ca, c);
  return ca;
}

function sub(a, b) {
  return [
    a[0] - b[0],
    a[1] - b[1]
  ];
}

function quadrance(a) {
  return a[0] * a[0] + a[1] * a[1];
}

function norm(a) {
  return Math.sqrt(quadrance(a));
}

function normalize(a) {
  return mulScalar(a, 1 / norm(a));
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}

module.exports = {
  clone: clone,
  add: add,
  add_: add_,
  mulScalar_: mulScalar_,
  mulScalar: mulScalar,
  sub: sub,
  quadrance: quadrance,
  norm: norm,
  normalize: normalize,
  dot: dot
};