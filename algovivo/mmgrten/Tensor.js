const utils = require("./utils");
const TensorIterator = require("./TensorIterator");
const IntTuple = require("./IntTuple");

class Tensor {
  constructor(args = {}) {
    const engine = args.engine;
    if (engine == null) {
      throw new Error("engine required to create tensor");
    }
    this.engine = engine;

    const shape = args.shape;
    if (shape == null) {
      throw new Error("shape required to create tensor");
    }
    if (shape instanceof IntTuple) {
      this.shape = shape;
    } else
    if (Array.isArray(shape)) {
      this.shape = engine.intTuple(shape);
    } else {
      throw new Error(`invalid shape type ${typeof shape}: ${shape}`);
    }
    this.order = this.shape.length;

    const numel = utils.numelOfShape(this.shape);
    this.numel = numel;

    const slot = args.slot;
    if (numel > 0 && slot == null) {
      throw new Error("memory slot required to create tensor");
    }
    this.slot = args.slot;
    this.ptr = this.slot.ptr;

    const stride = args.stride;
    if (stride != null) {
      if (stride instanceof IntTuple) {
        this.stride = stride;
      } else {
        throw new Error(`expected IntTuple stride, found ${typeof stride}: ${stride}`);
      }
    } else {
      this.setDefaultStride();
    }
  }

  get wasmInstance() {
    return this.engine.wasmInstance;
  }

  isScalar() {
    return this.order == 0;
  }

  fill_(x) {
    // TODO WASM function
    const data = utils.makeNdArray(this.shape, x);
    this.set(data);
  }

  clamp_(args = {}) {
    const min = args.min;
    const max = args.max;
    this.wasmInstance.exports.clamp(
      this.numel, this.ptr, this.ptr,
      min, max,
      min != null, max != null
    );
  }

  zero_() {
    this.fill_(0);
  }

  flattenIdx(_idx) {
    let idx;
    let tmpIdx = false;
    let flatIdx;
    if (Array.isArray(_idx)) {
      idx = this.engine.intTuple(_idx);
      tmpIdx = true;
    }
    if (idx instanceof IntTuple) {
      flatIdx = this.engine.wasmInstance.exports.flatten_idx(this.order, idx.slot.ptr, this.stride.slot.ptr);
    } else {
      throw new Error(`cannot handle ${typeof idx}: ${idx}`);
    }
    if (tmpIdx) idx.dispose();
    return flatIdx;
  }

  typedArray() {
    return this.slot.f32();
  }

  toArray() {
    const arr = utils.makeNdArray(this.shape, 0);
    this.forEach(idx => {
      const v = this.get(idx);
      utils.setArrElem(arr, idx, v)
    });
    return arr;
  }

  get(idx) {
    const flatIdx = this.flattenIdx(idx);
    return this.typedArray()[flatIdx];
  }

  item() {
    if (!this.isScalar()) {
      throw new Error(`item() only works for scalars, found tensor with shape ${this.shape}`);
    }
    return this.get([0]);
  }

  setDefaultStride() {
    let currentStride = 1;
    const order = this.order;
    const stride = [];
    for (let i = 0; i < order; i++) {
      stride.push(0);
    }
    for (let i = 0; i < order; i++) {
      const iReverse = order - 1 - i;
      stride[iReverse] = currentStride;
      currentStride *= this.shape.get(iReverse);
    }
    this.stride = this.engine.intTuple(stride);
  }

  setFromArray(arr) {
    const isScalar = this.isScalar();
    if (isScalar) {
      // arr can be a number, for scalar tensors
      if (typeof arr !== "number") {
        throw new Error(`expected number, found ${typeof arr}: ${arr}`);
      }

      this.set([0], arr);
    } else {
      if (!(Array.isArray(arr))) {
        throw new Error(`expected array, found ${typeof arr}: ${arr}`);
      }
      const arrShape = utils.inferShape(arr);
      if (!this.shape.equal(arrShape)) {
        throw new Error(`inconsistent shapes ${arrShape} != ${this.shape}`)
      }

      this.forEach((idx) => {
        const v = utils.getArrElem(arr, idx);
        this.set(idx, v);
      });
    }
  }

  set(idx, value) {
    if (value == null && Array.isArray(idx)) {
      this.setFromArray(idx);
    } else {
      const flatIdx = this.flattenIdx(idx);
      this.typedArray()[flatIdx] = value;
    }
  }

  forEach(f) {
    TensorIterator.shapeForEach(this.shape, f);
  }

  squeeze(i) {
    if (i == -1) i = this.shape.length - 1;
    // TODO check out of bounds
    const si = this.shape.get(i);
    if (si != 1) {
      throw new Error(`cannot squeeze a dimension that is not equal to 1, shape[${i}] = ${si}`);
    }
    const squeezedShape = [];
    for (let j = 0; j < this.order; j++) {
      if (i != j) {
        squeezedShape.push(this.shape.get(j));
      }
    }
    return new Tensor({
      engine: this.engine,
      shape: squeezedShape,
      slot: this.slot
    });
  }

  unsqueeze(i) {
    if (i == -1) i = this.shape.length - 1;
    const unsqueezedShape = [];
    for (let j = 0; j < this.order; j++) {
      unsqueezedShape.push(this.shape.get(j));
      if (i == j) {
        unsqueezedShape.push(1);
      }
    }
    return new Tensor({
      engine: this.engine,
      shape: unsqueezedShape,
      slot: this.slot
    });
  }

  add(b, c) {
    // c = a + b
    this.engine.functional.add(this, b, c);
  }

  sum(b) {
    this.engine.wasmInstance.exports.sum(
      this.numel,
      this.slot.ptr,
      b.slot.ptr
    );
  }

  dispose() {
    this.slot.free();
    this.shape.dispose();
    this.stride.dispose();
  }
}

module.exports = Tensor;