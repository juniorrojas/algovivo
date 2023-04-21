function inferShape(arr) {
  const shapeArr = [];
  let _arr = arr;
  while (true) {
    if (Array.isArray(_arr)) {
      shapeArr.push(_arr.length);
      _arr = _arr[0];
    } else {
      break;
    }
  }
  return shapeArr;
}

function _makeNdArray(arr, dim, shape, value) {
  if (dim == shape.length - 1) {
    for (let i = 0; i < shape[dim]; i++) {
      arr.push(value);
    }
  } else {
    for (let i = 0; i < shape[dim]; i++) {
      const li = [];
      arr.push(li);
      _makeNdArray(li, dim + 1, shape, value);
    }
  }
}

function makeNdArray(_shape, value) {
  const IntTuple = require("./IntTuple");
  let shape = _shape;
  if (_shape instanceof IntTuple) {
    shape = _shape.toArray();
  }
  const arr = [];
  _makeNdArray(arr, 0, shape, value);
  return arr;
}

function numelOfShape(shape) {
  let numel = 1;
  shape.forEach(si => {
    numel *= si;
  });
  return numel;
}

function getArrElem(arr, idx) {
  if (!Array.isArray(idx)) {
    throw new Error(`expected array, found ${typeof idx}: ${idx}`);
  }
  if (idx.length == 0) {
    return arr;
  } else {
    return getArrElem(arr[idx[0]], idx.slice(1));
  }
}

function setArrElem(arr, idx, v) {
  if (!Array.isArray(idx)) {
    throw new Error(`expected array, found ${typeof idx}: ${idx}`);
  }
  if (idx.length == 1) {
    arr[idx] = v;
  } else {
    return setArrElem(arr[idx[0]], idx.slice(1), v);
  }
}

module.exports = {
  inferShape,
  makeNdArray,
  numelOfShape,
  getArrElem,
  setArrElem
}