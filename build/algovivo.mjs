/**
 * algovivo
 * (c) 2023 Junior Rojas
 * License: MIT
 */
function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

class Node$1 {
  constructor(list, data) {
    this.list = list;
    this.data = data;
    this.next = null;
    this.prev = null;
  }

  append(data) {
    const node = new Node$1(this.list, data);

    if (this.list.last == this) this.list.last = node;
    
    node.next = this.next;
    node.prev = this;

    if (this.next != null) this.next.prev = node;

    this.next = node;
    this.list.size++;

    return node;
  }

  prepend(data) {
    const node = new Node$1(this.list, data);
    
    if (this.list.first == this) this.list.first = node;

    node.next = this;
    node.prev = this.prev;

    if (this.prev != null) this.prev.next = node;

    this.prev = node;
    this.list.size++;

    return node;
  }

  remove() {
    if (this.prev != null) this.prev.next = this.next;
    if (this.next != null) this.next.prev = this.prev;
    if (this.list.first == this) this.list.first = this.next;
    if (this.list.last == this) this.list.last = this.prev;
    this.list.size--;

    this.next = null;
    this.prev = null;
  }
}

var Node_1 = Node$1;

const Node = Node_1;

class ListIter {
  constructor(list) {
    this.list = list;
    this.nextNode = this.list.first;
  }

  next() {
    if (this.nextNode == null) {
      return {
        done: true
      };
    } else {
      const r = {
        done: false,
        value: this.nextNode.data
      };
      this.nextNode = this.nextNode.next;
      return r;
    }
  }
}

class List {
  constructor() {
    this.first = null;
    this.last = null;
    this.size = 0;
  }

  isEmpty() {
    if (
      (this.first == null && this.last != null) || 
      (this.first != null && this.last == null)
    ) {
      throw Error("inconsistent first last state");
    }
    return this.first == null;
  }

  append(data) {
    if (this.isEmpty()) {
      return this.setSingleton(data);
    } else {
      return this.last.append(data);
    }
  }

  prepend(data) {
    if (this.isEmpty()) {
      return this.setSingleton(data);
    } else {
      return this.first.prepend(data);
    }
  }

  setSingleton(data) {
    const node = new Node(this, data);
    this.first = node;
    this.last = node;
    this.size = 1;
    return node;
  }

  iter() {
    return new ListIter(this);
  }
}

var List_1 = List;

var linked$1 = {
  List: List_1,
  Node: Node_1
};

var ReservedSlot_1;
var hasRequiredReservedSlot;

function requireReservedSlot () {
	if (hasRequiredReservedSlot) return ReservedSlot_1;
	hasRequiredReservedSlot = 1;
	const Slot = requireSlot();

	class ReservedSlot extends Slot {
	  constructor(args = {}) {
	    super(args);
	  }

	  isFree() {
	    return false;
	  }

	  free() {
	    let freeSlot = this.appendFree(this.ptr, this.size);
	    this.remove();

	    const prev = freeSlot.prev();
	    const next = freeSlot.next();

	    if (prev != null && prev.isFree()) {
	      freeSlot = prev.merge(freeSlot);
	    }
	    if (next != null && next.isFree()) {
	      freeSlot = freeSlot.merge(next);
	    }

	    return freeSlot;
	  }
	}

	ReservedSlot_1 = ReservedSlot;
	return ReservedSlot_1;
}

var Slot_1;
var hasRequiredSlot;

function requireSlot () {
	if (hasRequiredSlot) return Slot_1;
	hasRequiredSlot = 1;
	class Slot {
	  constructor(args = {}) {
	    this.manager = args.manager;
	    this.ptr = args.ptr;
	    this.size = args.size;
	    this.node = args.node;
	  }

	  numBytes() {
	    return this.size;
	  }

	  prev() {
	    const prevNode = this.node.prev;
	    if (prevNode != null) return prevNode.data;
	    else return null;
	  }

	  next() {
	    const nextNode = this.node.next;
	    if (nextNode != null) return nextNode.data;
	    else return null;
	  }

	  appendReserved(ptr, size) {
	    const ReservedSlot = requireReservedSlot();
	    const node = this.node.append(null);
	    const slot = new ReservedSlot({
	      manager: this.manager,
	      ptr: ptr,
	      size: size,
	      node: node
	    });
	    node.data = slot;
	    this.manager._addReservedSlot(slot);
	    return slot;
	  }

	  appendFree(ptr, size) {
	    const FreeSlot = requireFreeSlot();
	    const node = this.node.append(null);
	    const slot = new FreeSlot({
	      manager: this.manager,
	      ptr: ptr,
	      size: size,
	      node: node
	    });
	    node.data = slot;
	    this.manager._addFreeSlot(slot);
	    return slot;
	  }

	  remove() {
	    this.node.remove();
	    this.node.data = null;
	    this.node = null;
	    if (this.isFree()) this.manager._removeFreeSlot(this);
	    else this.manager._removeReservedSlot(this);
	  }

	  toTypedArray(ArrayClass) {
	    const bytes = this.size;
	    const bytesPerElement = ArrayClass.BYTES_PER_ELEMENT;
	    if (bytes % bytesPerElement != 0) {
	      throw new Error(`size in bytes must be a multiple of ${bytesPerElement}, found ${bytes}`);
	    }
	    const start = this.ptr;
	    return new ArrayClass(
	      this.manager.array,
	      start,
	      bytes / bytesPerElement
	    );
	  }

	  f32() {
	    return this.toTypedArray(Float32Array);
	  }

	  u32() {
	    return this.toTypedArray(Uint32Array);
	  }
	}

	Slot_1 = Slot;
	return Slot_1;
}

var FreeSlot_1;
var hasRequiredFreeSlot;

function requireFreeSlot () {
	if (hasRequiredFreeSlot) return FreeSlot_1;
	hasRequiredFreeSlot = 1;
	const Slot = requireSlot();

	class FreeSlot extends Slot {
	  constructor(args = {}) {
	    super(args);
	  }

	  isFree() {
	    return true;
	  }

	  reserve(bytes) {
	    const availableBytes = this.numBytes();
	    if (bytes > availableBytes) {
	      throw new Error(`cannot reserve ${bytes} bytes, only ${availableBytes} bytes are available`);
	    }
	    const reserved = this.appendReserved(this.ptr, bytes);
	    reserved.appendFree(this.ptr + bytes, availableBytes - bytes);
	    this.remove();
	    return reserved;
	  }

	  merge(slot) {
	    if (!this.isFree() || !slot.isFree()) {
	      throw new Error("only free slots can be merged");
	    }
	    if (this.next() != slot) {
	      throw new Error("only adjacent slots can be merged");
	    }
	    const merged = slot.appendFree(
	      this.ptr,
	      this.size + slot.size
	    );
	    this.remove();
	    slot.remove();
	    return merged;
	  }
	}

	FreeSlot_1 = FreeSlot;
	return FreeSlot_1;
}

const linked = linked$1;
const FreeSlot = requireFreeSlot();

class MemoryManager {
  constructor(array, heapBase) {
    this.array = array;

    if (heapBase == null) heapBase = 0;

    this.slots = new linked.List();
    this.freeSlots = new linked.List();
    this.reservedSlots = new linked.List();

    const slot = new FreeSlot({
      manager: this,
      ptr: heapBase,
      size: array.byteLength - heapBase
    });
    
    const node = this.slots.append();
    node.data = slot;
    slot.node = node;
    
    const freeNode = this.freeSlots.append();
    freeNode.data = slot;
    slot.freeNode = freeNode;
  }

  numReservedSlots() {
    return this.reservedSlots.size;
  }

  numFreeSlots() {
    return this.freeSlots.size;
  }

  numFreeBytes() {
    let bytes = 0;
    const it = this.freeSlots.iter();
    let r = it.next();
    while (!r.done) {
      const slot = r.value;
      bytes += slot.size;
      r = it.next();
    }
    return bytes;
  }

  numReservedBytes() {
    let bytes = 0;
    const it = this.reservedSlots.iter();
    let r = it.next();
    while (!r.done) {
      const slot = r.value;
      bytes += slot.size;
      r = it.next();
    }
    return bytes;
  }

  mallocBytes(bytes) {
    return this._malloc(bytes);
  }

  malloc32(n) {
    return this.mallocBytes(n * 4);
  }

  _addReservedSlot(slot) {
    const node = this.reservedSlots.append(slot);
    slot.reservedNode = node;
  }

  _removeReservedSlot(slot) {
    if (slot.reservedNode == null) {
      throw new Error("reservedNode cannot be null");
    }
    slot.reservedNode.remove();
  }

  _addFreeSlot(slot) {
    const node = this.freeSlots.append(slot);
    slot.freeNode = node;
  }

  _removeFreeSlot(slot) {
    if (slot.freeNode == null) {
      throw new Error("freeNode cannot be null");
    }
    slot.freeNode.remove();
  }

  _malloc(size) {
    if (!Number.isInteger(size)) {
      throw new Error(`expected integer, found ${size}`);
    }
    let validFreeSlot = null;
    const it = this.freeSlots.iter();
    let r = it.next();
    while (!r.done) {
      const freeSlot = r.value;
      if (freeSlot.size >= size) {
        validFreeSlot = freeSlot;
        break;
      }
      r = it.next();
    }
    if (validFreeSlot == null) {
      throw new Error("no valid free slot available");
    }
    return validFreeSlot.reserve(size);
  }
}

var MemoryManager_1 = MemoryManager;

var mmgr$1 = {
  MemoryManager: MemoryManager_1,
  FreeSlot: requireFreeSlot(),
  ReservedSlot: requireReservedSlot()
};

// const mmgr = require("./mmgr");

class IntTuple$3 {
  constructor(args = {}) {
    const engine = args.engine;
    if (engine == null) {
      throw new Error("engine required to create IntTuple");
    }
    this.engine = engine;
    
    const slot = args.slot;
    if (slot == null) {
      throw new Error("slot required to create IntTuple");
    }
    // TODO check slot instanceof mmgr.Slot
    this.slot = slot;
    this.ptr = slot.ptr;

    this.length = args.length;
  }

  forEach(f) {
    for (let i = 0; i < this.length; i++) {
      f(this.get(i), i);
    }
  }

  equal(b) {
    if (b instanceof IntTuple$3) {
      for (let i = 0; i < this.length; i++) {
        const ai = this.get(i);
        const bi = b.get(i);
        if (ai != bi) return false;
      }
      return true;
    } else
    if (Array.isArray(b)) {
      for (let i = 0; i < this.length; i++) {
        const ai = this.get(i);
        const bi = b[i];
        if (ai != bi) return false;
      }
      return true;
    } else {
      return false;
    }
  }

  toArray() {
    const s = [];
    this.forEach((si) => {
      s.push(si);
    });
    return s;
  }

  typedArray() {
    return this.slot.u32();
  }

  set(i, v) {
    this.typedArray()[i] = v;
  }

  get(i) {
    return this.typedArray()[i];
  }

  dispose() {
    this.slot.free();
  }
}

var IntTuple_1 = IntTuple$3;

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
  const IntTuple = IntTuple_1;
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

var utils$2 = {
  inferShape,
  makeNdArray,
  numelOfShape,
  getArrElem,
  setArrElem
};

const IntTuple$2 = IntTuple_1;

class TensorIterator$1 {
  constructor(shape) {
    if (shape == null) throw new Error("shape required");
    if (!(shape instanceof IntTuple$2)) {
      throw new Error(`IntTuple shape expected, found ${typeof shape}: shape`);
    }
    this.shape = shape;
    this.done = false;
    this.idx = [];
    shape.forEach((si) => {
      this.idx.push(0);
    });
  }

  next() {
    const shape = this.shape;
    for (let _i = 0; _i < shape.length; _i++) {
      const i = shape.length - 1 - _i;
      if (this.idx[i] < shape.get(i) - 1) {
        this.idx[i]++;
        return;
      } else
      if (i == 0) {
        this.done = true;
        return;
      } else {
        this.idx[i] = 0;
      }
    }
  }

  static shapeForEach(shape, f) {
    const it = new TensorIterator$1(shape);
    while (!it.done) {
      f(it.idx);
      it.next();
    }
  }
}

var TensorIterator_1 = TensorIterator$1;

const utils$1 = utils$2;
const TensorIterator = TensorIterator_1;
const IntTuple$1 = IntTuple_1;

class Tensor$1 {
  constructor(args = {}) {
    const engine = args.engine;
    if (engine == null) {
      throw new Error("engine required to creat e tensor");
    }
    this.engine = engine;

    const shape = args.shape;
    if (shape == null) {
      throw new Error("shape required to create tensor");
    }
    if (shape instanceof IntTuple$1) {
      this.shape = shape;
    } else
    if (Array.isArray(shape)) {
      this.shape = engine.intTuple(shape);
    } else {
      throw new Error(`invalid shape type ${typeof shape}: ${shape}`);
    }
    this.order = this.shape.length;

    const numel = utils$1.numelOfShape(this.shape);
    this.numel = numel;

    const slot = args.slot;
    if (numel > 0 && slot == null) {
      throw new Error("memory slot required to create tensor");
    }
    this.slot = args.slot;
    this.ptr = this.slot.ptr;

    const stride = args.stride;
    if (stride != null) {
      if (stride instanceof IntTuple$1) {
        this.stride = stride;
      } else {
        throw new Error(`expected IntTuple stride, found ${typeof stride}: ${stride}`);
      }
    } else {
      this.setDefaultStride();
    }
  }

  isScalar() {
    return this.order == 0;
  }

  flattenIdx(_idx) {
    let idx;
    let tmpIdx = false;
    let flatIdx;
    if (Array.isArray(_idx)) {
      idx = this.engine.intTuple(_idx);
      tmpIdx = true;
    }
    if (idx instanceof IntTuple$1) {
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
    const arr = utils$1.makeNdArray(this.shape, 0);
    this.forEach(idx => {
      const v = this.get(idx);
      utils$1.setArrElem(arr, idx, v);
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
      const arrShape = utils$1.inferShape(arr);
      if (!this.shape.equal(arrShape)) {
        throw new Error(`inconsistent shapes ${arrShape} != ${this.shape}`)
      }

      this.forEach((idx) => {
        const v = utils$1.getArrElem(arr, idx);
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
    return new Tensor$1({
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
    return new Tensor$1({
      engine: this.engine,
      shape: unsqueezedShape,
      slot: this.slot
    });
  }

  pow2(output) {
    return this.engine.wasmInstance.exports.pow2(this.numel, this.slot.ptr, output.slot.ptr);
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
    // TODO if (this.ownedMemory)
    this.slot.free();
    this.shape.dispose();
    this.stride.dispose();
  }
}

var Tensor_1 = Tensor$1;

class Functional$1 {
  constructor(args = {}) {
    const engine = this.engine = args.engine;
    this.wasmInstance = engine.wasmInstance;
  }

  matvec(a, b, c) {
    const m = a.shape.get(0);
    const n = a.shape.get(1);
    const inputSize = b.shape.get(0);
    const outputSize = c.shape.get(0);
    if (m != outputSize) {
      throw new Error(`inconsistent output size ${m} != ${outputSize}`);
    }
    if (n != inputSize) {
      throw new Error(`inconsistent input size ${n} != ${inputSize}`);
    }
    this.wasmInstance.exports.matvec(
      m, n,
      a.stride.ptr, a.ptr,
      b.stride.ptr, b.ptr,
      c.stride.ptr, c.ptr
    );
  }

  mm(a, b, c) {
    const m = a.shape.get(0);
    const n = a.shape.get(1);
    const p = b.shape.get(1);
    this.wasmInstance.exports.mm(
      m, n, p,
      a.stride.ptr, a.ptr,
      b.stride.ptr, b.ptr,
      c.stride.ptr, c.ptr
    );
  }

  relu(a, b) {
    this.wasmInstance.exports.relu(
      a.numel,
      a.ptr,
      b.ptr
    );
  }

  tanh(a, b) {
    // TODO c++ version
    // this.wasmInstance.exports.tanh(
    //   a.numel,
    //   a.ptr,
    //   b.ptr
    // );
    const n = a.numel;
    const _a = a.typedArray();
    const _b = b.typedArray();
    for (let i = 0; i < n; i++) {
      _b[i] = Math.tanh(_a[i]);
    }
  }
  
  add(a, b, c) {
    this.wasmInstance.exports.add(
      a.numel,
      a.ptr,
      b.ptr,
      c.ptr
    );
  }

  sum(a, s) {
    this.wasmInstance.exports.sum(
      a.numel,
      a.ptr,
      s.ptr
    );
  }

  sumBackward(a, aGrad, s, sGrad) {
    this.wasmInstance.exports.sum_backward(
      a.numel,
      a.ptr,
      aGrad.ptr,
      s.ptr,
      sGrad.ptr
    );
  }
}

var Functional_1 = Functional$1;

class Module$4 {
  constructor() {

  }
}

var Module_1 = Module$4;

const Module$3 = Module_1;

class Sequential$1 extends Module$3 {
  constructor(nn, layers) {
    super();
    this.nn = nn;
    this.layers = layers;
  }

  forward(x) {
    let x1 = x;
    this.layers.forEach(layer => {
      x1 = layer.forward(x1);
    });
    return x1;
  }
}

var Sequential_1 = Sequential$1;

const Module$2 = Module_1;

class Linear$1 extends Module$2 {
  constructor(nn, inputSize, outputSize) {
    super();
    this.nn = nn;
    this.inputSize = inputSize;
    this.outputSize = outputSize;

    const ten = this.nn.engine;

    this.weight = ten.zeros([outputSize, inputSize]);
    this.bias = ten.zeros([outputSize]);

    this.output = ten.zeros([outputSize]);
  }

  forward(x) {
    const F = this.nn.engine.functional;
    F.matvec(this.weight, x, this.output);
    F.add(this.output, this.bias, this.output);
    return this.output;
  }
}

var Linear_1 = Linear$1;

const Module$1 = Module_1;

class ReLU$1 extends Module$1 {
  constructor(nn) {
    super();
    this.nn = nn;
    this.output = null;
  }

  forward(x) {
    const ten = this.nn.engine;
    // TODO check shape consistency if input has different shape
    if (this.output == null) {
      this.output = ten.zerosLike(x);
    }
    ten.functional.relu(x, this.output);
    return this.output;
  }
}

var ReLU_1 = ReLU$1;

const Module = Module_1;

class Tanh$1 extends Module {
  constructor(nn) {
    super();
    this.nn = nn;
    this.output = null;
  }

  forward(x) {
    const ten = this.nn.engine;
    // TODO check shape consistency if input has different shape
    if (this.output == null) {
      this.output = ten.zerosLike(x);
    }
    ten.functional.tanh(x, this.output);
    return this.output;
  }
}

var Tanh_1 = Tanh$1;

const Sequential = Sequential_1;
const Linear = Linear_1;
const ReLU = ReLU_1;
const Tanh = Tanh_1;

class nn$1 {
  constructor(args = {}) {
    this.engine = args.engine;
  }

  Linear(inputSize, outputSize) {
    return new Linear(this, inputSize, outputSize);
  }

  ReLU() {
    return new ReLU(this);
  }

  Tanh() {
    return new Tanh(this);
  }

  Sequential() {
    const layers = Array.from(arguments);
    return new Sequential(this, layers);
  }
}

var nn_1 = nn$1;

const mmgr = mmgr$1;
const utils = utils$2;
const Tensor = Tensor_1;
const IntTuple = IntTuple_1;
const Functional = Functional_1;
const nn = nn_1;

class Engine$1 {
  constructor(args = {}) {
    if (args.wasmInstance == null) {
      throw new Error("wasmInstance required");
    }
    this.wasmInstance = args.wasmInstance;
    const arr = args.wasmInstance.exports.memory.buffer;
    const mgr = new mmgr.MemoryManager(arr, args.wasmInstance.exports.__heap_base);
    this.mgr = mgr;

    this.functional = this.F = new Functional({
      engine: this
    });
    this.nn = new nn({
      engine: this
    });
    this._mergeF();
  }

  _mergeF() {
    Object.getOwnPropertyNames(Object.getPrototypeOf(this.F)).forEach(k => {
      if (k != "constructor") {
        this[k] = this.F[k];
      }
    });
  }

  tensor(data) {
    const shapeArr = utils.inferShape(data);
    const shape = this.intTuple(shapeArr);
    const numel = utils.numelOfShape(shapeArr);
    const slot = this.mgr.malloc32(numel);
    const tensor = new Tensor({
      engine: this,
      shape: shape,
      slot: slot
    });
    tensor.setFromArray(data);
    return tensor;
  }

  intTuple(data) {
    if (!Array.isArray(data)) {
      throw new Error(`expected array, found ${typeof data}: ${data}`);
    }
    const length = data.length;
    const slot = this.mgr.malloc32(length);
    const intTuple = new IntTuple({
      engine: this,
      length: length,
      slot: slot
    });
    for (let i = 0; i < length; i++) {
      intTuple.set(i, data[i]);
    }
    return intTuple;
  }

  zerosLike(x) {
    if (!(x instanceof Tensor)) {
      throw new Error(`expected tensor, found ${typeof x}: ${x}`);
    }
    return this.zeros(x.shape);
  }

  zeros(_shape) {
    let shape;
    if (_shape instanceof IntTuple) {
      shape = _shape;
    } else {
      if (!Array.isArray(_shape)) {
        throw new Error(`expected array, found ${typeof _shape}: ${_shape}`);
      }
      shape = this.intTuple(_shape);
    }    
    const numel = utils.numelOfShape(shape);
    const slot = this.mgr.malloc32(numel);
    const x = new Tensor({
      engine: this,
      shape: shape,
      slot: slot
    });
    this.wasmInstance.exports.zero_(numel, slot.ptr);
    return x;
  }
}

var Engine_1 = Engine$1;

const Engine = Engine_1;

function engine(args = {}) {
  const ten = new Engine({
    wasmInstance: args.wasmInstance
  });
  return ten;
}

var mmgrten$2 = {
  engine: engine,
  Engine: Engine,
  Tensor: Tensor_1,
  mmgr: mmgr$1,
  utils: utils$2
};

const mmgrten$1 = mmgrten$2;

class System$1 {
  constructor(args = {}) {
    if (args.wasmInstance == null) {
      throw new Error("wasmInstance required");
    }
    const ten = new mmgrten$1.Engine({
      wasmInstance: args.wasmInstance
    });
    this.ten = ten;

    const wasmInstance = ten.wasmInstance;
    const memoryManager = ten.mgr;

    this.wasmInstance = wasmInstance;
    this.memoryManager = memoryManager;
    this.fixedVertexId = -1;

    const h = 0.033;
    this.h = h;

    this.spaceDim = 2;
  }

  numVertices() {
    if (this.x0 == null) return 0;
    return this.x0.shape.get(0);
  }

  numTriangles() {
    if (this.triangles == null) return 0;
    return this.triangles.u32().length / 3;
  }

  numSprings() {
    if (this.springs == null) return 0;
    return this.springs.u32().length / 2;
  }

  setX(x) {
    const ten = this.ten;
    
    const spaceDim = this.spaceDim;
    const numVertices = x.length;

    const x0 = ten.tensor(x);
    if (this.x0 != null) this.x0.dispose();
    this.x0 = x0;

    const x1 = ten.zeros([numVertices, spaceDim]);
    if (this.x1 != null) this.x1.dispose();
    this.x1 = x1;

    const v0 = ten.zeros([numVertices, spaceDim]);
    if (this.v0 != null) this.v0.dispose();
    this.v0 = v0;

    const v1 = ten.zeros([numVertices, spaceDim]);
    if (this.v1 != null) this.v1.dispose();
    this.v1 = v1;

    this.updateTmpBuffers();
  }

  set(data) {
    const ten = this.ten;

    this.spaceDim;
    const numVertices = data.x.length;

    let numTriangles;
    if (data.triangles == null) {
      numTriangles = 0;
    } else {
      numTriangles = data.triangles.length;
    }

    const mgr = this.memoryManager;

    this.setX(data.x);
    
    const r = ten.zeros([numVertices]);
    if (this.r != null) this.r.dispose();
    this.r = r;
    
    const triangles = mgr.malloc32(numTriangles * 3);
    if (this.triangles != null) this.triangles.free();
    this.triangles = triangles;
    if (data.triangles != null) {
      data.triangles.forEach((t, i) => {
        triangles.u32()[i * 3]     = t[0];
        triangles.u32()[i * 3 + 1] = t[1];
        triangles.u32()[i * 3 + 2] = t[2];
      });
    }

    let edges;

    if (data.springs == null) {
      edges = [];
    } else {
      edges = data.springs;
    }
    
    const numSprings = edges.length;
    const springs = mgr.malloc32(numSprings * 2);

    edges.forEach((e, i) => {
      springs.u32()[i * 2] = e[0];
      springs.u32()[i * 2 + 1] = e[1];
    });
    
    if (this.springs != null) this.springs.free();
    this.springs = springs;

    const a = ten.zeros([numSprings]);
    if (this.a != null) this.a.dispose();
    this.a = a;

    const l0 = ten.zeros([numSprings]);
    if (this.l0 != null) this.l0.dispose();
    this.l0 = l0;
    if (data.springsL0 == null) {
      for (let i = 0; i < numSprings; i++) {
        a.slot.f32()[i] = 1;
        const [i1, i2] = edges[i];
        const p1 = data.x[i1];
        const p2 = data.x[i2];
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const q = dx * dx + dy * dy;
        const l0i = Math.sqrt(q);
        l0.slot.f32()[i] = l0i;
      }
    } else {
      for (let i = 0; i < numSprings; i++) {
        a.slot.f32()[i] = 1;
        const l0i = data.springsL0[i];
        l0.slot.f32()[i] = l0i;
      }
    }

    const rsi = ten.zeros([
      numTriangles, 2, 2
    ]);
    if (this.rsi != null) this.rsi.dispose();
    this.rsi = rsi;
    
    const rsiF32 = rsi.slot.f32();
    if (data.trianglesRsi == null) {
      for (let i = 0; i < numTriangles; i++) {
        const triangle = data.triangles[i];
        const a = data.x[triangle[0]];
        const b = data.x[triangle[1]];
        const c = data.x[triangle[2]];
        const abx = b[0] - a[0];
        const aby = b[1] - a[1];
        const acx = c[0] - a[0];
        const acy = c[1] - a[1];
        // const restShape = [
        //   [abx, acx],
        //   [aby, acy]
        // ];
        const d = abx * acy - acx * aby;
        const offset = i * 4;
        rsiF32[offset] = acy / d;
        rsiF32[offset + 1] = -acx / d;
        rsiF32[offset + 2] = -aby / d;
        rsiF32[offset + 3] = abx / d;
      }
    } else {
      for (let i = 0; i < numTriangles; i++) {
        const rsi1 = data.trianglesRsi[i];
        const offset = i * 4;
        rsiF32[offset    ] = rsi1[0][0];
        rsiF32[offset + 1] = rsi1[0][1];
        rsiF32[offset + 2] = rsi1[1][0];
        rsiF32[offset + 3] = rsi1[1][1];
      }
    }
  }

  backwardEulerLoss() {
    const wasmInstance = this.wasmInstance;
    return wasmInstance.exports.be_loss(
      this.numVertices(),
      this.x0.ptr, this.x0.ptr,
      this.v0.ptr,

      this.h,
      0,

      this.numSprings(),
      this.springs.ptr,

      this.numTriangles(),
      this.triangles.ptr,
      this.rsi.ptr,

      this.a.ptr,
      this.l0.ptr
    );
  }

  updateTmpBuffers() {
    if (this.x0 == null) {
      throw new Error("x0 required");
    }
    const numVertices = this.numVertices();
    const spaceDim = 2;
    const ten = this.ten;
    
    // TODO only allocate new memory if necessary
    const xGrad = ten.zeros([numVertices, spaceDim]);
    if (this.xGrad != null) this.xGrad.dispose();
    this.xGrad = xGrad;

    const xTmp =ten.zeros([numVertices, spaceDim]);
    if (this.xTmp != null) this.xTmp.dispose();
    this.xTmp = xTmp;
  }

  step() {
    const numVertices = this.numVertices();
    const numSprings = this.numSprings();
    const numTriangles = this.numTriangles();

    const fixedVertexId = this.fixedVertexId;

    this.wasmInstance.exports.be_step(
      numVertices,
      
      this.x1.ptr,
      this.xGrad.ptr,
      this.xTmp.ptr,

      this.x0.ptr,

      this.v0.ptr,
      this.v1.ptr,
      
      this.h,

      // this.r.ptr,
      0,

      numSprings,
      numSprings == 0 ? 0 : this.springs.ptr,

      numTriangles,
      numTriangles == 0 ? 0 : this.triangles.ptr,
      numTriangles == 0 ? 0 : this.rsi.ptr,

      numSprings == 0 ? 0 : this.a.ptr,
      numSprings == 0 ? 0 : this.l0.ptr,
      
      fixedVertexId
    );

    this.x0.slot.f32().set(this.x1.slot.f32());
    this.v0.slot.f32().set(this.v1.slot.f32());
  }
}

var System_1 = System$1;

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

var Vec2$1 = {
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

class Matrix2x2$1 {
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
    return new Matrix2x2$1(
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
    return new Matrix2x2$1(
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

    return new Matrix2x2$1(
      a00 * b00 + a01 * b10, a00 * b01 + a01 * b11,
      a10 * b00 + a11 * b10, a10 * b01 + a11 * b11
    );
  }

  t() {
    return new Matrix2x2$1(
      this.m00, this.m10,
      this.m01, this.m11
    );
  }

  static fromArray(a) {
    return new Matrix2x2$1(
      a[0][0], a[0][1],
      a[1][0], a[1][1]
    );
  }
}

var Matrix2x2_1 = Matrix2x2$1;

const Matrix2x2 = Matrix2x2_1;
const Vec2 = Vec2$1;

class Transform2d {
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

var Transform2d_1 = Transform2d;

class AABB {
  constructor(args = {}) {
    if (args.x0 == null) throw new Error("x0 required");
    if (args.y0 == null) throw new Error("y0 required");
    this._x0 = args.x0;
    this._y0 = args.y0;

    let x1 = null;
    if (args.width != null) {
      x1 = this._x0 + args.width;
    } else {
      if (args.x1 == null) throw new Error("x1 required");
      x1 = args.x1;
    }
    this._x1 = x1;

    let y1 = null;
    if (args.height != null) {
      y1 = this._y0 + args.height;
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

var AABB_1 = AABB;

var math$2 = {
  Vec2: Vec2$1,
  Matrix2x2: Matrix2x2_1,
  Transform2d: Transform2d_1,
  AABB: AABB_1
};

function computeDomCursor(event, domElement) {
  const rect = domElement.getBoundingClientRect();
  let clientX, clientY;
  if (event.touches == null) {
    clientX = event.clientX;
    clientY = event.clientY;
  } else {
    if (event.touches.length == 0) return null;
    const touch = event.touches[0];
    clientX = touch.clientX;
    clientY = touch.clientY;
  }
  const left = clientX - rect.left;
  const top = clientY - rect.top;
  const cursor = [left, top];
  return cursor;
}

var cursorUtils$1 = {
  computeDomCursor: computeDomCursor
};

const cursorUtils = cursorUtils$1;

class DragBehavior {
  constructor(args = {}) {
    this._dragging = false;

    this.onDomCursorDown = args.onDomCursorDown;
    this.onDragProgress = args.onDragProgress;
    this.onDomCursorUp = args.onDomCursorUp;

    this.domElement = null;
  }

  beginDrag() {
    this._dragging = true;
  }

  endDrag() {
    this._dragging = false;
  }

  dragging() {
    return this._dragging;
  }

  domCursorDown(domCursor, event) {
    if (this.onDomCursorDown != null) this.onDomCursorDown(domCursor, event);
  }

  domCursorMove(domCursor, event) {
    if (!this.dragging()) return;
    if (this.onDragProgress != null) this.onDragProgress(domCursor, event);
  }

  domCursorUp(domCursor, event) {
    this.endDrag();
    if (this.onDomCursorUp != null) this.onDomCursorUp(domCursor, event);
  }

  linkToDom(domElement) {
    if (this.domElement != null) {
      throw new Error("already linked to DOM");
    }
    this.domElement = domElement;
    const onDomCursorDown = (event) => {
      event.preventDefault();
      const domCursor = cursorUtils.computeDomCursor(event, domElement);
      this.domCursorDown(domCursor, event);
    };
    domElement.addEventListener("mousedown", onDomCursorDown, {passive: false});
    domElement.addEventListener("touchstart", onDomCursorDown, {passive: false});
    
    const onDomCursorMove = (event) => {
      const domCursor = cursorUtils.computeDomCursor(event, domElement);
      this.domCursorMove(domCursor, event);
    };
    domElement.addEventListener("mousemove", onDomCursorMove, {passive: false});
    domElement.addEventListener("touchmove", onDomCursorMove, {passive: false});

    const onDomCursorUp = (event) => {
      const domCursor = cursorUtils.computeDomCursor(event, domElement);
      this.domCursorUp(domCursor, event);
    };
    window.addEventListener("mouseup", onDomCursorUp);
    window.addEventListener("touchend", onDomCursorUp);
    window.addEventListener("touchcancel", onDomCursorUp);
  }
}

var DragBehavior_1 = DragBehavior;

var ui$2 = {
  cursorUtils: cursorUtils$1,
  DragBehavior: DragBehavior_1
};

class PointShader {
  constructor() {
  }

  renderPoint(args = {}) {
    const ctx = args.ctx;
    const p = args.p;
    
    const radius = 3;
    ctx.beginPath();
    ctx.arc(p[0], p[1], radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}

var PointShader_1 = PointShader;

class LineShader {
  constructor() {
  }

  renderLine(args = {}) {
    const ctx = args.ctx;
    const a = args.a;
    const b = args.b;
    
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 5;
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.closePath();
    ctx.stroke();
  }
}

var LineShader_1 = LineShader;

class TriangleShader {
  constructor() {
  }

  renderTriangle(args = {}) {
    const ctx = args.ctx;
    const a = args.a;
    const b = args.b;
    const c = args.c;
    
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.lineTo(c[0], c[1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

var TriangleShader_1 = TriangleShader;

var shaders$1 = {
  PointShader: PointShader_1,
  LineShader: LineShader_1,
  TriangleShader: TriangleShader_1
};

const math$1 = math$2;

class Camera {
  constructor() {
    this.transform = new math$1.Transform2d();
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

  center(args) {
    let scale = args.zoom ? args.zoom : 1;
    
    let viewportWidth = args.viewportWidth;
    let viewportHeight = args.viewportHeight;
    if (args.renderer != null) {
      // if present, args.renderer overwrites
      // viewportWidth and viewportHeight
      viewportWidth = args.renderer.width;
      viewportHeight = args.renderer.height;
    }

    if (args.worldWidth != null) {
      if (viewportWidth == null) {
        throw new Error("viewportWidth required");
      }
      scale = viewportWidth / args.worldWidth;
    }
    
    this.transform.linear = new math$1.Matrix2x2(
      scale, 0,
      0, -scale
    );

    let translation;
    if (args.worldCenter != null) {
      const worldCenter = args.worldCenter;
      translation = [
        viewportWidth * 0.5 - worldCenter[0] * scale,
        viewportHeight * 0.5 + worldCenter[1] * scale
      ];
    } else {
      translation = [
        viewportWidth * 0.5,
        viewportHeight * 0.5
      ];
    }
    this.transform.translation = translation;
  }
}

var Camera_1 = Camera;

const math = math$2;
const shaders = shaders$1;

class Mesh$2 {
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

var Mesh_1 = Mesh$2;

const Mesh$1 = Mesh_1;

class Renderer {
  constructor() {
    const canvas = document.createElement("canvas");
    this.domElement = canvas;
    this.ctx = canvas.getContext("2d");

    this.setSize({
      width: 200,
      height: 200
    });
  }

  setSize(args) {
    const width = args.width;
    if (width == null) throw new Error("width required to setSize");
    const height = args.height;
    if (height == null) throw new Error("height required to setSize");

    let viewportWidth = args.viewportWidth;
    if (viewportWidth == null) {
      viewportWidth = width;
    }
    let viewportHeight = args.viewportHeight;
    if (viewportHeight == null) {
      viewportHeight = height;
    }

    this.width = width;
    this.height = height;
    
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;

    const canvas = this.domElement;
    canvas.width = viewportWidth;
    canvas.height = viewportHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  renderPoint(renderer, mesh, camera, id, customArgs) {
    const ctx = this.ctx;
    let xi;
    if (mesh instanceof Mesh$1) xi = mesh.x[id];
    else {
      throw new Error("invalid mesh");
    }
    const p = camera.transform.apply(xi);
    ctx.save();
    mesh.pointShader.renderPoint({
      ctx: ctx,
      renderer: renderer,
      mesh: mesh,
      camera: camera,
      id: id,
      p: p,
      custom: customArgs
    });
    ctx.restore();
  }

  renderLine(renderer, mesh, camera, id, customArgs) {
    const ctx = this.ctx;
    const line = mesh.lines[id];
    const a = camera.transform.apply(mesh.x[line[0]]);
    const b = camera.transform.apply(mesh.x[line[1]]);
    
    ctx.save();
    mesh.lineShader.renderLine({
      ctx: ctx,
      renderer: renderer,
      mesh: mesh,
      camera: camera,
      id: id,
      a: a,
      b: b,
      custom: customArgs
    });
    ctx.restore();
  }

  renderTriangle(renderer, mesh, camera, id, customArgs) {
    const ctx = this.ctx;
    const triangle = mesh.triangles[id];

    const ia = triangle[0];
    const ib = triangle[1];
    const ic = triangle[2];

    let _a, _b, _c;
    if (mesh.x instanceof Float32Array) {
      const spaceDim = 2;
      _a = [mesh.x[ia * spaceDim], mesh.x[ia * spaceDim + 1]];
      _b = [mesh.x[ib * spaceDim], mesh.x[ib * spaceDim + 1]];
      _c = [mesh.x[ic * spaceDim], mesh.x[ic * spaceDim + 1]];
    } else {
      _a = mesh.x[ia];
      _b = mesh.x[ib];
      _c = mesh.x[ic];
    }

    const a = camera.transform.apply(_a);
    const b = camera.transform.apply(_b);
    const c = camera.transform.apply(_c);

    ctx.save();
    mesh.triangleShader.renderTriangle({
      ctx: ctx,
      renderer: renderer,
      mesh: mesh,
      camera: camera,
      id: id,
      a: a,
      b: b,
      c: c,
      custom: customArgs
    });
    ctx.restore();
  }

  renderMesh(renderer, mesh, camera, customArgs = {}) {
    for (let i = 0; i < mesh.triangles.length; i++) {
      this.renderTriangle(renderer, mesh, camera, i, customArgs);
    }

    for (let i = 0; i < mesh.lines.length; i++) {
      this.renderLine(renderer, mesh, camera, i, customArgs);
    }
    
    for (let i = 0; i < mesh.x.length; i++) {
      this.renderPoint(renderer, mesh, camera, i, customArgs);
    }
  }

  render(scene, camera, customArgs = {}) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);
    
    scene.meshes.forEach((mesh) => {
      this.renderMesh(
        this,
        mesh,
        camera,
        customArgs
      );
    });
  }
}

var Renderer_1 = Renderer;

const Mesh = Mesh_1;

class Scene {
  constructor() {
    this.meshes = new Map();
  }

  clean() {
    this.meshes = new Map();
  }

  numMeshes() {
    return this.meshes.size;
  }

  addMesh() {
    const id = this.meshes.size;
    const mesh = new Mesh({
      scene: this,
      id: id
    });
    this.meshes.set(id, mesh);
    return mesh;
  }
}

var Scene_1 = Scene;

var core = {
  Camera: Camera_1,
  Mesh: Mesh_1,
  Renderer: Renderer_1,
  Scene: Scene_1
};

class Floor$1 {
  constructor(args = {}) {
    if (args.scene == null) {
      throw new Error("scene required");
    }
    const scene = this.scene = args.scene;
    const mesh = this.mesh = scene.addMesh();
    mesh.x = [
      [-10, 0],
      [10, 0]
    ];
    mesh.lines = [
      [0, 1]
    ];

    mesh.lineShader.renderLine = Floor$1.makeFloorLineShader({
      width: args.width
    });

    mesh.setCustomAttribute("translation", [0, 0]);
  }

  static makeFloorLineShader(args = {}) {
    const width = (args.width == null) ? 0.055 : args.width;
    return (args) => {
      const ctx = args.ctx;
      const a = args.a;
      const b = args.b;
      const camera = args.camera;
      const mesh = args.mesh;
      const scale = camera.inferScale();

      const _translation = mesh.getCustomAttribute("translation");
      const translation = [scale * _translation[0], scale * _translation[1]];

      ctx.strokeStyle = "black";
      ctx.lineWidth = scale * width;
      ctx.beginPath();
      ctx.moveTo(a[0] + translation[0], a[1] + translation[1]);
      ctx.lineTo(b[0] + translation[0], b[1] + translation[1]);
      ctx.stroke();
    }
  }
}

var Floor_1 = Floor$1;

const Floor = Floor_1;

function makePointShader(args = {}) {
  const radius = (args.radius == null) ? 0.028 : args.radius;
  const borderColor = (args.borderColor == null) ? "black" : args.borderColor;
  const fillColor = (args.fillColor == null) ? "white" : args.fillColor;
  const borderWidth = (args.borderWidth == null) ? 0.023 : args.borderWidth;

  return (args) => {
    const ctx = args.ctx;
    const p = args.p;
    const camera = args.camera;
    const scale = camera.inferScale();
    
    const radius1 = (radius + borderWidth) * scale;
    ctx.fillStyle = borderColor;
    ctx.beginPath();
    ctx.arc(p[0], p[1], radius1, 0, 2 * Math.PI);
    ctx.fill();

    const radius2 = radius * scale;
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(p[0], p[1], radius2, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function makeFiberShader(args = {}) {
  const color0 = (args.color0 == null) ? [255, 0, 0] : args.color0;
  const color1 = (args.color1 == null) ? [250, 190, 190] : args.color1;
  const width = (args.width == null) ? 0.065 : args.width;
  const borderWidth = (args.borderWidth == null) ? 0.017 : args.borderWidth;
  const borderColor = (args.borderColor == null) ? "black" : args.borderColor;
  const lineCap = (args.lineCap == null) ? "butt" : args.lineCap;
  const muscleIntensityAttributeName = (args.muscleIntensityAttributeName == null) ? "muscleIntensity" : args.muscleIntensityAttributeName;
  return (args) => {
    const ctx = args.ctx;
    const a = args.a;
    const b = args.b;
    const mesh = args.mesh;
    const camera = args.camera;
    const scale = camera.inferScale();

    ctx.beginPath();
    ctx.lineCap = lineCap;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = (width + borderWidth * 2) * scale;
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();

    ctx.beginPath();

    const muscleIntensity = mesh.getCustomAttribute(muscleIntensityAttributeName);
    if (muscleIntensity == null) {
      throw new Error(`muscle intensity attribute (${muscleIntensityAttributeName}) not found, call setCustomAttribute("${muscleIntensityAttributeName}", value) before rendering.`);
    }
    if (!Array.isArray(muscleIntensity)) {
      throw new Error(`muscle intensity attribute must be an array with values for each fiber, found ${typeof muscleIntensity}`);
    }
    const numLines = mesh.lines.length;
    if (muscleIntensity.length != numLines) {
      throw new Error(`expected ${numLines} values in muscle intensity attribute, found ${muscleIntensity.length}`);
    }
    const t = muscleIntensity[args.id];
    
    const cr0 = color0[0];
    const cr1 = color1[0];

    const cg0 = color0[1];
    const cg1 = color1[1];

    const cb0 = color0[2];
    const cb1 = color1[2];

    const cr = (1 - t) * cr0 + t * cr1;
    const cg = (1 - t) * cg0 + t * cg1;
    const cb = (1 - t) * cb0 + t * cb1;

    ctx.strokeStyle = `rgb(${cr}, ${cg}, ${cb})`;
    ctx.lineCap = lineCap;
    ctx.lineWidth = width * scale;
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);

    ctx.stroke();
  }
}

function makeTriangleShader(args = {}) {
  const borderWidth = (args.borderWidth == null) ? 0.029 : args.borderWidth;
  const borderColor = (args.borderColor == null) ? "black" : args.borderColor;
  const fillColor = (args.fillColor == null) ? "white" : args.fillColor;
  return (args) => {
    const ctx = args.ctx;
    const a = args.a;
    const b = args.b;
    const c = args.c;
    const camera = args.camera;
    const scale = camera.inferScale();

    ctx.beginPath();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = (borderWidth * 2) * scale;
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.lineTo(c[0], c[1]);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.fillStyle = fillColor;
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.lineTo(c[0], c[1]);
    ctx.closePath();
    ctx.fill();
  }
}

function makeFloorShader(args = {}) {
  // TODO parameterize
  const color = "black";
  const width = 0.055;
  return (args) => {
    const ctx = args.ctx;
    const a = args.a;
    const b = args.b;
    const camera = args.camera;
    const scale = camera.inferScale();

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineWidth = width * scale;
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.closePath();
    ctx.stroke();
  }
}

var custom = {
  makePointShader: makePointShader,
  makeFiberShader: makeFiberShader,
  makeTriangleShader: makeTriangleShader,
  makeFloorShader: makeFloorShader,
  Floor: Floor
};

function makeGridData(args = {}) {
  const cellSize = (args.cellSize == null) ? 1 : args.cellSize;
  const innerDivs = (args.innerCells == null) ? 3 : args.innerCells;
  const rows = (args.rows == null) ? 3 : args.rows;
  const cols = (args.cols == null) ? 4 : args.cols;
  const x0 = (args.x0 == null) ? -2 : args.x0;
  const y0 = (args.y0 == null) ? 0 : args.y0;
  const primaryLineWidth = (args.primaryLineWidth == null) ? 0.022 : args.primaryLineWidth;
  const secondaryLineWidth = (args.secondaryLineWidth == null) ? 0.008 : args.secondaryLineWidth;

  const x = [];
  const lineIndices = [];
  const lineWidths = [];

  const y1 = y0 + rows * cellSize;
  const x1 = x0 + cols * cellSize;

  function makeLines(n, addVertices) {
    for (let i = 0; i < n + 1; i++) {
      const _innerDivs = (i == n) ? 1 : innerDivs;
      for (let i1 = 0; i1 < _innerDivs; i1++) {
        // why * 2? because every line creates 2 vertices
        const idx = lineIndices.length * 2;
        addVertices(i, i1, _innerDivs, x);
        lineIndices.push([idx, idx + 1]);
        if (i1 == 0) {
          lineWidths.push(primaryLineWidth);
        } else {
          lineWidths.push(secondaryLineWidth);
        }
      }
    }
  }

  // rows
  makeLines(rows, (i, i1, _innerDivs, x) => {
    const _y0 = y0 + i * cellSize;
    const _y1 = y0 + (i + 1) * cellSize;
    const t = i1 / _innerDivs;
    const _y = _y0 * (1 - t) + _y1 * t;
    x.push([x0, _y]);
    x.push([x1, _y]);
  });

  // columns
  makeLines(cols, (i, i1, _innerDivs, x) => {
    const _x0 = x0 + i * cellSize;
    const _x1 = x0 + (i + 1) * cellSize;
    const t = i1 / _innerDivs;
    const _x = _x0 * (1 - t) + _x1 * t;
    x.push([_x, y0]);
    x.push([_x, y1]);
  });

  return [x, lineIndices, lineWidths];
}

class Grid {
  constructor(args = {}) {
    if (args.scene == null) {
      throw new Error("scene required");
    }
    const color = (args.color == null) ? "rgba(0, 0, 0, 0.30)" : args.color;
    const cellSize = (args.cellSize == null) ? 1 : args.cellSize;
    const innerCells = (args.innerCells == null) ? 3 : args.innerCells;
    const rows = (args.rows == null) ? 3 : args.rows;
    const cols = (args.cols == null) ? 4 : args.cols;
    const x0 = (args.x0 == null) ? -2 : args.x0;
    const y0 = (args.y0 == null) ? 0 : args.y0;
    const primaryLineWidth = (args.primaryLineWidth == null) ? 0.03 : args.primaryLineWidth;
    const secondaryLineWidth = (args.secondaryLineWidth == null) ? 0.008 : args.secondaryLineWidth;

    const mesh = this.mesh = args.scene.addMesh();
    const data = makeGridData({
      cellSize,
      innerCells,
      rows, cols,
      x0, y0,
      primaryLineWidth, secondaryLineWidth
    });
    mesh.x = data[0];
    mesh.lines = data[1];
    mesh.setCustomAttribute("lineWidths", data[2]);
    mesh.setCustomAttribute("translation", [0, 0]);

    mesh.pointShader.renderPoint = () => {};

    mesh.lineShader.renderLine = Grid.makeGridLineShader({
      color: color
    });
  }

  static makeGridLineShader(args = {}) {
    const color = (args.color == null) ? "black" : args.color;
    return (args) => {
      const ctx = args.ctx;
      const a = args.a;
      const b = args.b;
      const camera = args.camera;
      const mesh = args.mesh;
      const scale = camera.inferScale();

      ctx.beginPath();
      ctx.strokeStyle = color;
      const lineWidths = mesh.getCustomAttribute("lineWidths");
      if (lineWidths == null) {
        throw new Error("custom attribute lineWidths missing");
      }
      const lineWidth = lineWidths[args.id];

      const _translation = mesh.getCustomAttribute("translation");
      const translation = [scale * _translation[0], scale * _translation[1]];

      ctx.lineWidth = lineWidth * scale;
      ctx.moveTo(a[0] + translation[0], a[1] + translation[1]);
      ctx.lineTo(b[0] + translation[0], b[1] + translation[1]);
      ctx.closePath();
      ctx.stroke();
    }
  }
}

var Grid_1 = Grid;

class Background {
  constructor(args = {}) {
    if (args.scene == null) {
      throw new Error("scene required");
    }
    const mesh = this.mesh = args.scene.addMesh();
    mesh.x = [[0, 0]];
    
    const color1 = (args.color1 == null) ? "#fcfcfc" : args.color1;
    const color2 = (args.color2 == null) ? "#d7d8d8" : args.color2;
    mesh.pointShader.renderPoint = (args = {}) => {
      const width = args.renderer.width;
      const height = args.renderer.height;
      const ctx = args.ctx;

      const grd = ctx.createRadialGradient(
        width * 0.5, height * 0.5, width * 0.05,
        width * 0.5, height * 0.5, width * 0.5
      );
      grd.addColorStop(0, color1);
      grd.addColorStop(1, color2);
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);
    };
  }
}

var Background_1 = Background;

var background = {
  Grid: Grid_1,
  Background: Background_1
};

var mm2d$1 = {
  math: math$2,
  ui: ui$2,
  shaders: shaders$1,
  core: core,
  custom: custom,
  background: background
};

const mm2d = mm2d$1;

function hashSimplex(vids) {
  vids.sort();
  return vids.join("_");
}

function edgesFromTriangles(triangles) {
  const edges = new Map();
  
  function addEdge(i1, i2) {
    const hash = hashSimplex([i1, i2]);
    edges.set(hash, [i1, i2]);
  }

  triangles.forEach(t => {
    addEdge(t[0], t[1]);
    addEdge(t[1], t[2]);
    addEdge(t[0], t[2]);
  });
  return Array.from(edges.values());
}

class SystemViewport {
  constructor(args = {}) {
    if (args.system == null) {
      throw new Error("system required");
    }
    this.system = args.system;

    const renderer = new mm2d.core.Renderer();
    renderer.domElement.style.border = "1px solid black";
    renderer.setSize({
      width: 400,
      height: 400
    });
    this.renderer = renderer;
    this.domElement = renderer.domElement;

    const scene = new mm2d.core.Scene();
    this.scene = scene;

    const camera = new mm2d.core.Camera();
    this.camera = camera;

    new mm2d.background.Background({
      scene: scene
    });
    this.grid = new mm2d.background.Grid({
      scene: scene,
      x0: -3,
      y0: 0,
      rows: 4,
      cols: 10,
      innerCells: 2,
      primaryLineWidth: 0.022,
      secondaryLineWidth: 0.005,
      color: "#acadad"
    });
    this.floor = new mm2d.custom.Floor({
      scene: scene
    });

    const mesh = scene.addMesh();
    this.mesh = mesh;

    const muscleMesh = scene.addMesh();
    this.muscleMesh = muscleMesh;
    
    mesh.pointShader.renderPoint = mm2d.custom.makePointShader();

    mesh.triangleShader.renderTriangle = (args = {}) => {
      const ctx = args.ctx;
      const a = args.a;
      const b = args.b;
      const c = args.c;
      const camera = args.camera;
      camera.inferScale();

      ctx.beginPath();
      ctx.fillStyle = "white";
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.lineTo(c[0], c[1]);
      ctx.closePath();
      ctx.fill();
    };
    mesh.lineShader.renderLine = (args = {}) => {
      const ctx = args.ctx;
      const a = args.a;
      const b = args.b;
      args.c;
      const camera = args.camera;
      const scale = camera.inferScale();

      const borderWidth = 0.029;
      const borderColor = "black";
      ctx.beginPath();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = (borderWidth) * scale;
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.closePath();
      ctx.stroke();
    };

    muscleMesh.pointShader.renderPoint = mm2d.custom.makePointShader({});
    
    muscleMesh.lineShader.renderLine = mm2d.custom.makeFiberShader({
    });

    const dragBehavior = this.dragBehavior = new mm2d.ui.DragBehavior({
      onDomCursorDown: (domCursor, event) => {
        if ("button" in event && event.button != 0) return;
        const sim = this.system;
        const worldCursor = camera.domToWorldSpace(domCursor);
        const vertexId = this.hitTestVertex(worldCursor);
        if (vertexId != null) {
          this.fixVertex(vertexId);
          dragBehavior.beginDrag();
          this.setVertexPos(
            sim.fixedVertexId,
            [worldCursor[0], Math.max(0, worldCursor[1])]
          );
        }
      },
      onDragProgress: (domCursor) => {
        const sim = this.system;
        const worldCursor = camera.domToWorldSpace(domCursor);
        this.setVertexPos(
          sim.fixedVertexId,
          [worldCursor[0], Math.max(0, worldCursor[1])]
        );
      },
      onDomCursorUp: () => {
        this.freeVertex();
      }
    });
    dragBehavior.linkToDom(renderer.domElement);

    this.targetCenterX = null;
    this.currentCenterX = null;
  }

  render() {
    if (this.needsMeshUpdate == null || this.needsMeshUpdate) {
      const trianglesArr = [];
      const trianglesU32 = this.system.triangles.u32();
      for (let i = 0; i < this.system.numTriangles(); i++) {
        const offset = i * 3;
        trianglesArr.push([
          trianglesU32[offset    ],
          trianglesU32[offset + 1],
          trianglesU32[offset + 2]
        ]);
      }

      const springsArr = [];
      const springsU32 = this.system.springs.u32();
      for (let i = 0; i < this.system.numSprings(); i++) {
        const offset = i * 2;
        springsArr.push([
          springsU32[offset    ],
          springsU32[offset + 1]
        ]);
      }

      this._updateMesh({
        triangles: trianglesArr,
        springs: springsArr
      });

      this.needsMeshUpdate = false;
    }

    const renderer = this.renderer;
    const scene = this.scene;
    const camera = this.camera;
    const mesh = this.mesh;

    this._updateSim(this.system);

    if (!this.dragBehavior.dragging()) {
      const meshCenter = mesh.computeCenter();
      const meshCenterX = meshCenter[0];

      this.targetCenterX = meshCenterX;

      if (this.currentCenterX == null) {
        this.currentCenterX = this.targetCenterX;
      } else {
        this.currentCenterX += (this.targetCenterX - this.currentCenterX) * 0.5;
      }

      const recenterThreshold = 3;
      const cx = this.currentCenterX;
      const tx = Math.floor(cx / recenterThreshold) * recenterThreshold;
      this.grid.mesh.setCustomAttribute(
        "translation",
        [tx, 0]
      );
      this.floor.mesh.setCustomAttribute(
        "translation",
        [tx, 0]
      );

      const center = [this.currentCenterX, 1];
      camera.center({
        worldCenter: center,
        worldWidth: 3.8,
        viewportWidth: renderer.width,
        viewportHeight: renderer.height,
      });
    }
    
    renderer.render(scene, camera);
  }

  _updateMesh(meshData) {
    const mesh = this.mesh;
    const muscleMesh = this.muscleMesh;

    if (meshData.x != null) {
      mesh.x = meshData.x;
      muscleMesh.x = meshData.x;
    }

    mesh.triangles = meshData.triangles;
    mesh.lines = edgesFromTriangles(meshData.triangles);
    muscleMesh.lines = meshData.springs;

    const muscleIntensity = [];
    const numSprings = muscleMesh.lines.length;
    for (let i = 0; i < numSprings; i++) {
      muscleIntensity.push(1);
    }
    muscleMesh.setCustomAttribute("muscleIntensity", muscleIntensity);
  }

  _updateSim(sim) {
    this.system = sim;
    const mesh = this.mesh;
    const muscleMesh = this.muscleMesh;

    const x = sim.x0.toArray();
    mesh.x = x;
    muscleMesh.x = x;

    const muscleIntensity = [];
    const numSprings = sim.numSprings();
    for (let i = 0; i < numSprings; i++) {
      muscleIntensity.push(sim.a.slot.f32()[i]);
    }
    muscleMesh.setCustomAttribute("muscleIntensity", muscleIntensity);
  }

  hitTestVertex(p) {
    const numVertices = this.system.numVertices();
    const xF32 = this.system.x0.slot.f32();
    for (let i = 0; i < numVertices; i++) {
      const offset = i * 2;
      const xi = [xF32[offset], xF32[offset + 1]];
      const d = mm2d.math.Vec2.sub(xi, p);
      const q = mm2d.math.Vec2.quadrance(d);
      if (q < 0.1) {
        return i;
      }
    }
    return null;
  }

  setVertexPos(i, p) {
    const sim = this.system;
    const xF32 = sim.x0.slot.f32();
    const offset = i * 2;
    xF32[offset] = p[0];
    xF32[offset + 1] = p[1];
  }

  setVertexVel(i, p) {
    const sim = this.system;
    const vF32 = sim.v0.slot.f32();
    const offset = i * 2;
    vF32[offset] = p[0];
    vF32[offset + 1] = p[1];
  }

  fixVertex(vertexId) {
    const sim = this.system;
    this.setVertexVel(vertexId, [0, 0]);
    if (vertexId == null) {
      vertexId = -1;
    }
    sim.fixedVertexId = vertexId;
  }

  freeVertex() {
    const sim = this.system;
    sim.fixedVertexId = -1;
  }
}

var SystemViewport_1 = SystemViewport;

var ui$1 = {
  SystemViewport: SystemViewport_1
};

const System = System_1;
const mmgrten = mmgrten$2;
const ui = ui$1;

var algovivo = {
  System: System,
  mmgrten: mmgrten,
  SystemViewport: ui.SystemViewport
};

var index = /*@__PURE__*/getDefaultExportFromCjs(algovivo);

export { index as default };
