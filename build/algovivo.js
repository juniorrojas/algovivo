/**
 * algovivo
 * (c) 2023 Junior Rojas
 * License: MIT
 * 
 * Built from commit 5ebdda8f6d42428ff385d709ff45cb0bacc10ffd
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.algovivo = factory());
})(this, (function () { 'use strict';

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

	  *[Symbol.iterator]() {
	    const it = this.iter();
	    let r = it.next();
	    while (!r.done) {
	      yield r.value;
	      r = it.next();
	    }
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

	    this.ptrToSlot = new Map();

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

	  malloc(n) {
	    const slot = this._malloc(n);
	    this.ptrToSlot.set(slot.ptr, slot);
	    return slot.ptr;
	  }

	  free(ptr) {
	    const slot = this.ptrToSlot.get(ptr);
	    slot.free();
	  }
	}

	var MemoryManager_1 = MemoryManager;

	var mmgr$1 = {
	  linked: linked$1,
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

	  toString() {
	    return this.slot.u32().toString();
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
	      throw new Error("engine required to create tensor");
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

	  get ptr() {
	    return this.slot.ptr;
	  }

	  get wasmInstance() {
	    return this.engine.wasmInstance;
	  }

	  isScalar() {
	    return this.order == 0;
	  }

	  fill_(x) {
	    this.wasmInstance.exports.fill_(this.numel, this.ptr, x);
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
	    if (this.numel == 0) return [];
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
	    if (this.numel == 0) return;

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
	    if (this.slot == null) throw new Error("tensor already disposed");
	    this.slot.free();
	    this.slot = null;
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

	  dispose() {
	    this.layers.forEach(layer => {
	      layer.dispose();
	    });
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

	  dispose() {
	    this.weight.dispose();
	    this.bias.dispose();
	    this.output.dispose();
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

	  dispose() {
	    if (this.output != null) this.output.dispose();
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

	  dispose() {
	    if (this.output != null) this.output.dispose();
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
	    if (args.wasmInstance != null) this.init(args);
	    this.env = {};
	  }

	  init(args = {}) {
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
	    return this.zeros(x.shape.toArray());
	  }

	  empty(_shape) {
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
	    return x;
	  }

	  zeros(shape) {
	    const x = this.empty(shape);
	    x.zero_();
	    return x;
	  }

	  ones(shape) {
	    const x = this.empty(shape);
	    x.fill_(1);
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

	class Vertices$2 {
	  constructor(args = {}) {
	    const ten = args.ten;
	    if (ten == null) throw new Error("ten required");
	    this.ten = ten;

	    this.spaceDim = args.spaceDim ?? 2;

	    this.vertexMass = args.vertexMass ?? 6.0714287757873535;

	    this.pos0 = null;
	    this.pos1 = null;
	    this.vel0 = null;
	    this.vel1 = null;

	    this.posGrad = null;
	    this.posTmp = null;

	    this._fixedVertexId = -1;
	  }

	  getVertexPos(i) {
	    const pos = [];
	    for (let j = 0; j < this.spaceDim; j++) {
	      pos.push(this.pos.get([i, j]));
	    }
	    return pos;
	  }

	  set fixedVertexId(value) {
	    throw new Error("use fixVertex instead");
	  }

	  get fixedVertexId() {
	    return this._fixedVertexId;
	  }

	  fixVertex(vertexId) {
	    this._fixedVertexId = vertexId;
	  }

	  freeVertex() {
	    this._fixedVertexId = -1;
	  }

	  get pos() {
	    return this.pos0;
	  }

	  get vel() {
	    return this.vel0;
	  }

	  get numVertices() {
	    if (this.pos0 == null) return 0;
	    return this.pos0.shape.get(0);
	  }

	  updateTmpBuffers() {
	    if (this.pos0 == null) {
	      throw new Error("pos0 required");
	    }
	    const numVertices = this.numVertices;
	    const spaceDim = this.spaceDim;
	    const ten = this.ten;
	    
	    // TODO only allocate new memory if necessary
	    const posGrad = ten.zeros([numVertices, spaceDim]);
	    if (this.posGrad != null) this.posGrad.dispose();
	    this.posGrad = posGrad;

	    const posTmp = ten.zeros([numVertices, spaceDim]);
	    if (this.posTmp != null) this.posTmp.dispose();
	    this.posTmp = posTmp;
	  }

	  get wasmInstance() {
	    return this.ten.wasmInstance;
	  }

	  get memoryManager() {
	    return this.ten.mgr;
	  }

	  set(pos) {
	    const ten = this.ten;
	    
	    const spaceDim = this.spaceDim;

	    if (pos == null) throw new Error("pos required");
	    const numVertices = pos.length;

	    const pos0 = ten.tensor(pos);
	    if (this.pos0 != null) this.pos0.dispose();
	    this.pos0 = pos0;

	    const pos1 = ten.zeros([numVertices, spaceDim]);
	    if (this.pos1 != null) this.pos1.dispose();
	    this.pos1 = pos1;

	    const vel0 = ten.zeros([numVertices, spaceDim]);
	    if (this.vel0 != null) this.vel0.dispose();
	    this.vel0 = vel0;

	    const vel1 = ten.zeros([numVertices, spaceDim]);
	    if (this.vel1 != null) this.vel1.dispose();
	    this.vel1 = vel1;

	    this.updateTmpBuffers();
	  }

	  addVertex(args = {}) {
	    const ten = this.ten;
	    const numVertices0 = this.numVertices;
	    const spaceDim = this.spaceDim;
	    
	    const pos0 = ten.empty([numVertices0 + 1, spaceDim]);
	    const vel0 = ten.empty([numVertices0 + 1, spaceDim]);
	    const pos1 = ten.empty([numVertices0 + 1, spaceDim]);
	    const vel1 = ten.empty([numVertices0 + 1, spaceDim]);
	    
	    for (let i = 0; i < numVertices0; i++) {
	      for (let j = 0; j < spaceDim; j++) {
	        pos0.set([i, j], this.pos0.get([i, j]));
	        vel0.set([i, j], this.vel0.get([i, j]));
	        pos1.set([i, j], this.pos1.get([i, j]));
	        vel1.set([i, j], this.vel1.get([i, j]));
	      }
	    }

	    const pi = args.pos ?? [0, 0];
	    const vi = args.vel ?? [0, 0];
	    for (let j = 0; j < spaceDim; j++) {
	      pos0.set([numVertices0, j], pi[j]);
	      pos1.set([numVertices0, j], pi[j]);
	      vel0.set([numVertices0, j], vi[j]);
	      vel1.set([numVertices0, j], vi[j]);
	    }

	    if (this.pos0 != null) this.pos0.dispose();
	    this.pos0 = pos0;

	    if (this.vel0 != null) this.vel0.dispose();
	    this.vel0 = vel0;

	    if (this.pos1 != null) this.pos1.dispose();
	    this.pos1 = pos1;

	    if (this.vel1 != null) this.vel1.dispose();
	    this.vel1 = vel1;

	    this.updateTmpBuffers();
	  }

	  dispose() {
	    if (this.pos0 != null) {
	      this.pos0.dispose();
	      this.pos0 = null;
	    }
	    if (this.pos1 != null) {
	      this.pos1.dispose();
	      this.pos1 = null;
	    }
	    if (this.vel0 != null) {
	      this.vel0.dispose();
	      this.vel0 = null;
	    }
	    if (this.vel1 != null) {
	      this.vel1.dispose();
	      this.vel1 = null;
	    }
	    if (this.posGrad != null) {
	      this.posGrad.dispose();
	      this.posGrad = null;
	    }
	    if (this.posTmp != null) {
	      this.posTmp.dispose();
	      this.posTmp = null;
	    }
	  }
	}

	var Vertices_1 = Vertices$2;

	class Muscles$1 {
	  constructor(args = {}) {
	    const ten = args.ten;
	    if (ten == null) throw new Error("ten required");
	    this.ten = ten;

	    this.muscles = null;
	    this.k = Math.fround(90);
	    this.l0 = null;
	    this.a = null;
	  }

	  get wasmInstance() {
	    return this.ten.wasmInstance;
	  }

	  get memoryManager() {
	    return this.ten.mgr;
	  }

	  get numMuscles() {
	    if (this.muscles == null) return 0;
	    return this.muscles.u32().length / 2;
	  }

	  set(args = {}) {
	    if (args.indices == null) {
	      throw new Error("indices required");
	    }
	    const indices = args.indices;
	    const numMuscles = indices.length;
	    const numMuscles0 = this.numMuscles;

	    const mgr = this.memoryManager;
	    const ten = this.ten;

	    if (args.k != null) this.k = args.k;

	    const muscles = mgr.malloc32(numMuscles * 2);
	    if (this.muscles != null) this.muscles.free();
	    this.muscles = muscles;

	    const musclesU32 = muscles.u32();
	    indices.forEach((m, i) => {
	      const offset = i * 2;
	      musclesU32[offset    ] = m[0];
	      musclesU32[offset + 1] = m[1];
	    });

	    if (this.l0 != null) this.l0.dispose();
	    this.l0 = null;

	    if (numMuscles != 0) {
	      const l0 = ten.zeros([numMuscles]);
	      this.l0 = l0;

	      if (args.l0 == null) {
	        this.wasmInstance.exports.l0_of_pos(
	          this.numVertices,
	          args.pos.ptr,
	          numMuscles,
	          this.muscles.ptr,
	          this.l0.ptr
	        );
	      } else {
	        this.l0.set(args.l0);
	      }
	    }

	    const keepA = args.keepA ?? false;
	    if (numMuscles != numMuscles0) {
	      if (keepA) {
	        throw new Error(`keepA can only be true when the number of muscles is the same (${numMuscles} != ${numMuscles0})`);
	      }
	      if (this.a != null) {
	        this.a.dispose();
	        this.a = null;
	      }
	      if (numMuscles != 0) {
	        const a = ten.zeros([numMuscles]);
	        this.a = a;
	        a.fill_(1);
	      }
	    } else
	    if (numMuscles == 0) {
	      if (this.a != null) this.a.dispose();
	      this.a = null;
	    } else {
	      // numMuscles == numMuscles0 != 0
	      if (!keepA) {
	        this.a.fill_(1);
	      }
	    }
	  }

	  dispose() {
	    if (this.muscles != null) {
	      this.muscles.free();
	      this.muscles = null;
	    }
	    if (this.l0 != null) {
	      this.l0.dispose();
	      this.l0 = null;
	    }
	    if (this.a != null) {
	      this.a.dispose();
	      this.a = null;
	    }
	  }
	}

	var Muscles_1 = Muscles$1;

	class Triangles$1 {
	  constructor(args = {}) {
	    const ten = args.ten;
	    if (ten == null) throw new Error("ten required");
	    this.ten = ten;

	    this.simplexOrder = args.simplexOrder ?? 3;
	    this.triangles = null;
	    this.rsi = null;
	    this.mu = null;
	    this.lambda = null;
	  }

	  get wasmInstance() {
	    return this.ten.wasmInstance;
	  }

	  get memoryManager() {
	    return this.ten.mgr;
	  }

	  get numElements() {
	    if (this.indices == null) return 0;
	    return this.indices.u32().length / this.simplexOrder;
	  }

	  get numTriangles() {
	    return this.numElements;
	  }

	  get indices() {
	    return this.triangles;
	  }

	  toStepArgs() {
	    const numElements = this.numElements;
	    return [
	      numElements,
	      numElements == 0 ? 0 : this.indices.ptr,
	      numElements == 0 ? 0 : this.rsi.ptr,
	      numElements == 0 ? 0 : this.mu.ptr,
	      numElements == 0 ? 0 : this.lambda.ptr
	    ];
	  }

	  set(args = {}) {
	    const indices = args.indices;
	    const rsi = args.rsi;
	    const numTriangles = indices ? indices.length : this.numTriangles;

	    if (indices == null && (!rsi || rsi.length !== numTriangles)) {
	      throw new Error("rsi is not consistent with the number of indices");
	    }

	    const mgr = this.memoryManager;
	    const ten = this.ten;
	    
	    const triangles = indices ? mgr.malloc32(numTriangles * this.simplexOrder) : this.triangles;
	    if (indices && this.triangles != null) this.triangles.free();
	    this.triangles = triangles;

	    if (indices != null) {
	      const trianglesU32 = triangles.u32();
	      indices.forEach((t, i) => {
	        const offset = i * this.simplexOrder;
	        for (let j = 0; j < this.simplexOrder; j++) {
	          trianglesU32[offset + j] = t[j];
	        }
	      });
	    }
	    
	    if (this.rsi != null) this.rsi.dispose();
	    this.rsi = ten.zeros([numTriangles, this.simplexOrder - 1, this.simplexOrder - 1]);
	    
	    if (rsi == null) {
	      let pos = null;
	      let tmpPos = false;
	      if (args.pos != null) {
	        if (Array.isArray(args.pos)) {
	          pos = ten.tensor(args.pos);
	          tmpPos = true;
	        } else {
	          pos = args.pos;
	          if (pos.ptr == null) throw new Error("invalid pos");
	        }
	      }

	      this.wasmInstance.exports.rsi_of_pos(
	        this.numVertices,
	        pos.ptr,
	        numTriangles,
	        this.triangles.ptr,
	        this.rsi.ptr
	      );

	      if (tmpPos) pos.dispose();
	    } else {
	      this.rsi.set(rsi);
	    }
	    
	    if (this.mu != null) this.mu.dispose();
	    this.mu = ten.zeros([numTriangles]);
	    this.mu.fill_(Math.fround(500));

	    if (this.lambda != null) this.lambda.dispose();
	    this.lambda = ten.zeros([numTriangles]);
	    this.lambda.fill_(Math.fround(50));
	  }

	  dispose() {
	    if (this.triangles != null) {
	      this.triangles.free();
	      this.triangles = null;
	    }
	    if (this.rsi != null) {
	      this.rsi.dispose();
	      this.rsi = null;
	    }
	    if (this.mu != null) {
	      this.mu.dispose();
	      this.mu = null;
	    }
	    if (this.lambda != null) {
	      this.lambda.dispose();
	      this.lambda = null;
	    }
	  }
	}

	var Triangles_1 = Triangles$1;

	const mmgrten$1 = mmgrten$2;
	const Vertices$1 = Vertices_1;
	const Muscles = Muscles_1;
	const Triangles = Triangles_1;

	class System$1 {
	  constructor(args = {}) {
	    let ten;
	    if (args.ten == null) {
	      const wasmInstance = args.wasmInstance;
	      if (wasmInstance == null) {
	        throw new Error("wasmInstance required");
	      }
	      ten = new mmgrten$1.Engine({
	        wasmInstance: args.wasmInstance
	      });
	      this.ten = ten;
	    } else {
	      ten = args.ten;
	      this.ten = ten;
	    }
	    
	    this.h = 0.033;
	    this.g = 9.8;

	    this.spaceDim = args.spaceDim ?? 2;

	    this._vertices = new Vertices$1({ ten: this.ten, vertexMass: args.vertexMass, spaceDim: this.spaceDim });
	    this._muscles = new Muscles({ ten: this.ten });
	    this._triangles = new Triangles({ ten: this.ten, simplexOrder: this.spaceDim + 1 });

	    this.friction = { k: Math.fround(300) };
	  }

	  get vertices() {
	    return this._vertices;
	  }

	  set fixedVertexId(value) {
	    throw new Error("System.fixedVertexId setter is deprecated, use System.vertices.fixedVertexId instead");
	  }

	  get fixedVertexId() {
	    throw new Error("System.fixedVertexId getter is deprecated, use System.vertices.fixedVertexId instead");
	  }

	  get wasmInstance() {
	    return this.ten.wasmInstance;
	  }

	  get memoryManager() {
	    return this.ten.mgr;
	  }

	  get vertexMass() {
	    return this._vertices.vertexMass;
	  }

	  get triangles() {
	    return this._triangles.triangles;
	  }

	  set triangles(value) {
	    this._triangles.triangles = value;
	  }

	  get rsi() {
	    return this._triangles.rsi;
	  }

	  set rsi(value) {
	    this._triangles.rsi = value;
	  }

	  get k() {
	    return this._muscles.k;
	  }

	  set k(value) {
	    this._muscles.k = value;
	  }

	  get pos0() {
	    return this._vertices.pos;
	  }

	  get vel0() {
	    return this._vertices.vel0;
	  }

	  get pos() {
	    return this.vertices.pos;
	  }

	  get vel() {
	    return this.vertices.vel;
	  }

	  get numVertices() {
	    return this._vertices.numVertices;
	  }

	  get numTriangles() {
	    return this._triangles.numTriangles;
	  }

	  get numMuscles() {
	    return this._muscles.numMuscles;
	  }

	  get muscles() {
	    return this._muscles.muscles;
	  }

	  set muscles(value) {
	    this._muscles.muscles = value;
	  }

	  get a() {
	    return this._muscles.a;
	  }

	  set a(value) {
	    this._muscles.a = value;
	  }

	  get l0() {
	    return this._muscles.l0;
	  }

	  set l0(value) {
	    this._muscles.l0 = value;
	  }

	  setVertices(pos) {
	    this._vertices.set(pos);
	  }

	  setMuscles(args = {}) {
	    this._muscles.set({ ...args, pos: args.pos ?? this.pos0 });
	  }

	  setTriangles(args = {}) {
	    this._triangles.set({ ...args, pos: args.pos ?? this.pos0 });
	  }

	  getMusclesArray() {
	    if (this.muscles == null) return [];
	    
	    const numMuscles = this.numMuscles;
	    const musclesU32 = this.muscles.u32();
	    const muscles = [];
	    for (let i = 0; i < numMuscles; i++) {
	      const offset = i * 2;
	      muscles.push([
	        musclesU32[offset    ],
	        musclesU32[offset + 1]
	      ]);
	    }
	    return muscles;
	  }

	  getTrianglesArray() {
	    if (this.triangles == null) return [];
	    
	    const numTriangles = this.numTriangles;
	    const trianglesU32 = this.triangles.u32();
	    const triangles = [];
	    for (let i = 0; i < numTriangles; i++) {
	      const offset = i * 3;
	      triangles.push([
	        trianglesU32[offset    ],
	        trianglesU32[offset + 1],
	        trianglesU32[offset + 2]
	      ]);
	    }
	    return triangles;
	  }

	  set(args) {
	    this.setVertices(args.pos);

	    this.setMuscles({
	      indices: args.muscles ?? [],
	      l0: args.musclesL0,
	      k: args.musclesK
	    });

	    this.setTriangles({
	      indices: args.triangles ?? [],
	      rsi: args.trianglesRsi
	    });
	  }

	  step() {
	    const numVertices = this.numVertices;
	    const numMuscles = this.numMuscles;

	    const fixedVertexId = this.vertices._fixedVertexId;
	    const vertexMass = this.vertexMass;

	    this.wasmInstance.exports.backward_euler_update(
	      this.spaceDim,
	      this.g,
	      this.h,

	      numVertices,
	      numVertices == 0 ? 0 : this.pos0.ptr,
	      numVertices == 0 ? 0 : this.vel0.ptr,
	      vertexMass,

	      numMuscles,
	      numMuscles == 0 ? 0 : this.muscles.ptr,
	      this.k,
	      numMuscles == 0 ? 0 : this.a.ptr,
	      numMuscles == 0 ? 0 : this.l0.ptr,

	      ...this._triangles.toStepArgs(),

	      this.friction.k,

	      fixedVertexId,

	      numVertices == 0 ? 0 : this._vertices.pos1.ptr,
	      numVertices == 0 ? 0 : this._vertices.posGrad.ptr,
	      numVertices == 0 ? 0 : this._vertices.posTmp.ptr,
	      numVertices == 0 ? 0 : this._vertices.vel1.ptr,
	    );
	    
	    if (numVertices != 0) {
	      this._vertices.pos0.slot.f32().set(this._vertices.pos1.slot.f32());
	      this._vertices.vel0.slot.f32().set(this._vertices.vel1.slot.f32());
	    }
	  }

	  dispose() {
	    this._vertices.dispose();
	    this._muscles.dispose();
	    this._triangles.dispose();
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

	  get x0() { return this._x0; }
	  get x1() { return this._x1; }
	  get y0() { return this._y0; }
	  get y1() { return this._y1; }
	  get width() { return this._x1 - this._x0; }
	  get height() { return this._y1 - this._y0; }

	  get center() {
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

	  center(args = {}) {
	    let viewportWidth = args.viewportWidth;
	    let viewportHeight = args.viewportHeight;

	    const renderer = args.renderer;
	    if ((viewportWidth == null || viewportHeight == null) && renderer == null) {
	      throw new Error("renderer required");
	    }
	    if (renderer != null) {
	      // if present, args.renderer overwrites
	      // viewportWidth and viewportHeight
	      viewportWidth = renderer.width;
	      viewportHeight = renderer.height;
	    }

	    if (viewportWidth == null) {
	      throw new Error("viewportWidth required");
	    }
	    if (viewportHeight == null) {
	      throw new Error("viewportHeight required");
	    }

	    let scale = args.zoom ?? 1;
	    if (args.worldWidth != null) {
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
	    return new math.AABB({
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
	      math.Vec2.add_(center, xi);
	    }
	    math.Vec2.mulScalar_(center, 1 / numVertices);
	    return center;
	  }
	}

	var Mesh_1 = Mesh$2;

	const Mesh$1 = Mesh_1;

	class Renderer {
	  constructor(args = {}) {
	    const headless = args.headless ?? false;
	    this.headless = headless;

	    if (!headless) {
	      const canvas = document.createElement("canvas");
	      this.domElement = canvas;
	      this.ctx = canvas.getContext("2d");
	    }

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

	    if (!this.headless) {
	      const canvas = this.domElement;
	      canvas.width = viewportWidth;
	      canvas.height = viewportHeight;
	      canvas.style.width = `${width}px`;
	      canvas.style.height = `${height}px`;
	    }
	  }

	  renderPoint(renderer, mesh, camera, id, customArgs) {
	    const ctx = this.ctx;
	    let xi;
	    if (mesh instanceof Mesh$1) xi = mesh.pos[id];
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
	    const a = camera.transform.apply(mesh.pos[line[0]]);
	    const b = camera.transform.apply(mesh.pos[line[1]]);
	    
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
	    if (mesh.pos instanceof Float32Array) {
	      const spaceDim = 2;
	      _a = [mesh.pos[ia * spaceDim], mesh.pos[ia * spaceDim + 1]];
	      _b = [mesh.pos[ib * spaceDim], mesh.pos[ib * spaceDim + 1]];
	      _c = [mesh.pos[ic * spaceDim], mesh.pos[ic * spaceDim + 1]];
	    } else {
	      _a = mesh.pos[ia];
	      _b = mesh.pos[ib];
	      _c = mesh.pos[ic];
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
	    const sortedElements = mesh.sortedElements;

	    if (sortedElements == null) {
	      for (let i = 0; i < mesh.triangles.length; i++) {
	        this.renderTriangle(renderer, mesh, camera, i, customArgs);
	      }

	      for (let i = 0; i < mesh.lines.length; i++) {
	        this.renderLine(renderer, mesh, camera, i, customArgs);
	      }
	      
	      for (let i = 0; i < mesh.pos.length; i++) {
	        this.renderPoint(renderer, mesh, camera, i, customArgs);
	      }
	    } else {
	      sortedElements.forEach((element) => {
	        if (element.order == null) {
	          throw new Error(`invalid element, order not defined ${element}`);
	        }

	        if (element.order == 1) {
	          this.renderPoint(renderer, mesh, camera, element.id, customArgs);
	        } else
	        if (element.order == 2) {
	          this.renderLine(renderer, mesh, camera, element.id, customArgs);
	        } else
	        if (element.order == 3) {
	          this.renderTriangle(renderer, mesh, camera, element.id, customArgs);
	        } else {
	          throw new Error(`invalid element ${element}`);
	        }
	      });
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

	var core$1 = {
	  Camera: Camera_1,
	  Mesh: Mesh_1,
	  Renderer: Renderer_1,
	  Scene: Scene_1
	};

	function computeDomCursor(event, domElement) {
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

	  // get cumulative transformation matrix
	  let matrix = new DOMMatrix();
	  let element = domElement;
	  while (element != null) {
	    const style = window.getComputedStyle(element);
	    const elementMatrix = new DOMMatrix(style.transform);
	    matrix = elementMatrix.multiply(matrix);
	    element = element.parentElement;
	  }
	  const matrixInverse = matrix.inverse();

	  // compute cursor position in the domElement's coordinate system
	  const clientPos = new DOMPointReadOnly(clientX, clientY);
	  const transformedClientPos = clientPos.matrixTransform(matrixInverse);

	  // transform domElement's bounding rectangle
	  const rect = domElement.getBoundingClientRect();
	  const topLeft = new DOMPointReadOnly(rect.left, rect.top);
	  const transformedTopLeft = topLeft.matrixTransform(matrixInverse);

	  const x = transformedClientPos.x - transformedTopLeft.x;
	  const y = transformedClientPos.y - transformedTopLeft.y;
	  const cursor = [x, y];
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

	  linkToDom(domElement, domElementForMoveEvents = null) {
	    if (this.domElement != null) {
	      throw new Error("already linked to DOM");
	    }
	    this.domElement = domElement;
	    const onDomCursorDown = (event) => {
	      event.preventDefault();
	      const domCursor = cursorUtils.computeDomCursor(event, domElement);
	      this.domCursorDown(domCursor, event);
	    };
	    domElement.addEventListener("mousedown", onDomCursorDown, { passive: false });
	    domElement.addEventListener("touchstart", onDomCursorDown, { passive: false });
	    
	    const onDomCursorMove = (event) => {
	      const domCursor = cursorUtils.computeDomCursor(event, domElement);
	      this.domCursorMove(domCursor, event);
	    };
	    if (domElementForMoveEvents == null) domElementForMoveEvents = domElement;
	    domElementForMoveEvents.addEventListener("mousemove", onDomCursorMove, { passive: false });
	    domElementForMoveEvents.addEventListener("touchmove", onDomCursorMove, { passive: false });

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

	var ui = {
	  cursorUtils: cursorUtils$1,
	  DragBehavior: DragBehavior_1
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

	  return { x, lineIndices, lineWidths };
	}

	class Grid {
	  constructor(args = {}) {
	    if (args.scene == null) {
	      throw new Error("scene required");
	    }

	    const color = (args.color == null) ? "rgba(0, 0, 0, 0.30)" : args.color;

	    const mesh = this.mesh = args.scene.addMesh();

	    this.set(args);
	    
	    mesh.setCustomAttribute("translation", [0, 0]);

	    mesh.pointShader.renderPoint = () => {};

	    mesh.lineShader.renderLine = Grid.makeGridLineShader({
	      color: color
	    });
	  }

	  get numVertices() {
	    return this.mesh.x.length;
	  }

	  get numLines() {
	    return this.mesh.lines.length;
	  }

	  set(args = {}) {
	    const cellSize = (args.cellSize == null) ? 1 : args.cellSize;
	    const innerCells = (args.innerCells == null) ? 3 : args.innerCells;
	    const rows = (args.rows == null) ? 3 : args.rows;
	    const cols = (args.cols == null) ? 4 : args.cols;
	    const x0 = (args.x0 == null) ? -2 : args.x0;
	    const y0 = (args.y0 == null) ? 0 : args.y0;
	    const primaryLineWidth = (args.primaryLineWidth == null) ? 0.03 : args.primaryLineWidth;
	    const secondaryLineWidth = (args.secondaryLineWidth == null) ? 0.008 : args.secondaryLineWidth;

	    const mesh = this.mesh;

	    const { x, lineIndices, lineWidths } = makeGridData({
	      cellSize,
	      innerCells,
	      rows, cols,
	      x0, y0,
	      primaryLineWidth, secondaryLineWidth
	    });
	    mesh.pos = x;
	    mesh.lines = lineIndices;
	    mesh.setCustomAttribute("lineWidths", lineWidths);
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
	    mesh.pos = [[0, 0]];
	    
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

	class Simplex$1 {
	  constructor(id, vertexIds) {
	    if (id == null) {
	      throw new Error("id required to create simplex");
	    }
	    this.order = vertexIds.length;
	    this.id = id;
	    this.vertexIds = vertexIds;
	  }
	}

	var Simplex_1 = Simplex$1;

	const Simplex = Simplex_1;

	function hashSimplex$1(vids) {
	  vids.sort();
	  return vids.join("_");
	}

	class Simplices$3 {
	  constructor(args = {}) {
	    if (args.order == null) throw new Error("order required");
	    this.order = args.order;
	    this.simplicesByHash = new Map();
	  }

	  forEach(f) {
	    this.simplicesByHash.forEach(f);
	  }

	  size() {
	    return this.simplicesByHash.size;
	  }

	  has(simplex) {
	    return this.simplicesByHash.has(hashSimplex$1(simplex.vertexIds));
	  }

	  add(simplex, id) {
	    let vertexIds = null;
	    if (Array.isArray(simplex)) {
	      if (id == null) throw new Error("id required");
	      vertexIds = simplex;
	      simplex = new Simplex(id, vertexIds);
	    } else {
	      vertexIds = simplex.vertexIds;
	      if (vertexIds == null) {
	        throw new Error(`vertexIds required ${simplex}`);
	      }
	      id = simplex.id;
	    }
	    if (vertexIds.length != this.order) {
	      throw new Error(`expected ${this.order} vertices, found ${vertexIds.length}`);
	    }
	    const h = hashSimplex$1(vertexIds);
	    this.simplicesByHash.set(h, simplex);
	    return simplex;
	  }
	}

	var Simplices_1 = Simplices$3;

	const Simplices$2 = Simplices_1;

	class Vertex$1 {
	  constructor(id) {
	    this.id = id;
	    this.edges = new Simplices$2({ order: 2 });
	    this.triangles = new Simplices$2({ order: 3 });
	  }

	  addTriangle(triangle, id) {
	    this.triangles.add(triangle, id);
	  }

	  addEdge(edge, id) {
	    this.edges.add(edge, id);
	  }
	}

	var Vertex_1 = Vertex$1;

	const Simplices$1 = Simplices_1;
	const Vertex = Vertex_1;

	class MeshTopology$1 {
	  constructor(args = {}) {
	    this.vertices = new Map();
	    this.edges = new Simplices$1({ order: 2 });
	    this.triangles = new Simplices$1({ order: 3 });
	    
	    const edges = args.edges ?? [];
	    edges.forEach((e, i) => {
	      this.addEdge(i, e);
	    });
	    
	    const triangles = args.triangles ?? [];
	    triangles.forEach((t, i) => {
	      this.addTriangle(i, t);
	    });
	  }

	  numVertices() {
	    return this.vertices.size;
	  }

	  numEdges() {
	    return this.edges.size();
	  }

	  numTriangles() {
	    return this.triangles.size();
	  }

	  getVertexById(id, create = false) {
	    let vertex = this.vertices.get(id);
	    if (vertex == null && create) {
	      vertex = new Vertex(id);
	      this.vertices.set(id, vertex);
	    }
	    return vertex;
	  }

	  addEdge(id, vertexIds) {
	    const edge = this.edges.add(vertexIds, id);
	    vertexIds.forEach(vid => {
	      this.getVertexById(vid, true).addEdge(edge);
	    });
	    return edge;
	  }

	  addTriangle(id, vertexIds) {
	    const triangle = this.triangles.add(vertexIds, id);
	    vertexIds.forEach(vid => {
	      this.getVertexById(vid, true).addTriangle(triangle);
	    });
	    return triangle;
	  }
	}

	var MeshTopology_1 = MeshTopology$1;

	const MeshTopology = MeshTopology_1;
	const Simplices = Simplices_1;

	function makeSortedElements(args = {}) {
	  if (args.sortedVertexIds == null) {
	    throw new Error("sortedVertexIds required");
	  }
	  if (args.triangles == null) {
	    throw new Error("triangles required");
	  }
	  if (args.edges == null) {
	    throw new Error("edges required");
	  }
	  const sortedVertexIds = args.sortedVertexIds;
	  
	  const vertexIdToOrder = new Map();
	  sortedVertexIds.forEach((id, order) => {
	    vertexIdToOrder.set(id, order);
	  });

	  const triangleTopology = new MeshTopology({
	    triangles: args.triangles
	  });
	  const edgeTopology = new MeshTopology({
	    edges: args.edges
	  });
	  
	  const sortedElements = [];
	  const trianglesAdded = new Simplices({ order: 3 });
	  const edgesAdded = new Simplices({ order: 2 });

	  sortedVertexIds.forEach((vertexId) => {
	    const triangles = triangleTopology.getVertexById(vertexId, true).triangles;
	    const edges = edgeTopology.getVertexById(vertexId, true).edges;

	    const sortedSimplices = [];
	    triangles.forEach(t => {
	      sortedSimplices.push(t);
	    });
	    edges.forEach(e => {
	      sortedSimplices.push(e);
	    });

	    sortedSimplices.sort((a, b) => {
	      // TODO max order vertex could be pre-sorted in the simplex
	      const aOrders = a.vertexIds.map(i => vertexIdToOrder.get(i));
	      const bOrders = b.vertexIds.map(i => vertexIdToOrder.get(i));
	      const ai1 = Math.max(...aOrders);
	      const bi1 = Math.max(...bOrders);
	      if (ai1 < bi1) {
	        return 1;
	      } else
	      if (ai1 == bi1) {
	        return 0;
	      } else {
	        return -1;
	      }
	    });

	    sortedSimplices.forEach(simplex => {
	      if (simplex.order == 2) {
	        const edge = simplex;
	        if (!edgesAdded.has(edge)) {
	          sortedElements.push(edge);
	          edgesAdded.add(edge);
	        }
	      } else {
	        const triangle = simplex;
	        if (!trianglesAdded.has(triangle)) {
	          sortedElements.push(triangle);
	          trianglesAdded.add(triangle);
	        }
	      }
	    });

	    sortedElements.push({
	      order: 1,
	      id: vertexId
	    });
	  });
	  return sortedElements;
	}

	var sorted = {
	  makeSortedElements: makeSortedElements,
	  MeshTopology: MeshTopology_1,
	  Simplex: Simplex_1,
	  Simplices: Simplices_1
	};

	const core = core$1;

	var mm2d$3 = {
	  math: math$2,
	  ui: ui,
	  shaders: shaders$1,
	  background: background,
	  sorted: sorted,
	  core: core,
	  Renderer: core.Renderer,
	  Camera: core.Camera,
	  Scene: core.Scene
	};

	class Tracker$1 {
	  constructor(args = {}) {
	    this.targetCenterX = null;
	    this.currentCenterX = null;
	    this.active = true;
	    this.visibleWorldWidth = args.visibleWorldWidth ?? 3.8;
	    this.targetCenterY = args.targetCenterY ?? 1;
	    this.offsetX = args.offsetX ?? 0;
	    this.fullGrid = false;
	    this.centeringSpeedFactor = 0.5 ;
	  }

	  step(args = {}) {
	    if (!this.active) return;
	    
	    const renderer = args.renderer;
	    const camera = args.camera;
	    const mesh = args.mesh;
	    const floor = args.floor;
	    const grid = args.grid;

	    let meshCenter = [0, 0];
	    if (mesh.pos.length > 0) meshCenter = mesh.computeCenter();
	    const meshCenterX = meshCenter[0] + this.offsetX;

	    if (!isNaN(meshCenterX)) this.targetCenterX = meshCenterX;

	    if (this.currentCenterX == null) {
	      this.currentCenterX = this.targetCenterX;
	    } else {
	      this.currentCenterX += (this.targetCenterX - this.currentCenterX) * this.centeringSpeedFactor;
	    }

	    const center = [this.currentCenterX, this.targetCenterY];
	    camera.center({
	      worldCenter: center,
	      worldWidth: this.visibleWorldWidth,
	      viewportWidth: renderer.width,
	      viewportHeight: renderer.height,
	    });

	    const topRight = camera.domToWorldSpace([renderer.width, 0]);
	    const bottomLeft = camera.domToWorldSpace([0, renderer.height]);

	    const marginCells = 1;
	    
	    const [_x0, _y0] = bottomLeft;
	    const x0 = Math.floor(_x0) - marginCells;
	    let y0 = Math.floor(_y0);
	    if (!this.fullGrid) {
	      if (y0 < 0) {
	        y0 = 0;
	      }
	    }
	    const [_x1, _y1] = topRight;
	    const x1 = _x1;
	    const y1 = _y1;

	    const width = x1 - x0;
	    const height = y1 - y0;
	    const rows = Math.ceil(height) + marginCells;
	    const cols = Math.ceil(width) + marginCells;

	    grid.set({
	      x0: x0,
	      y0: y0,
	      rows: rows,
	      cols: cols,

	      innerCells: grid.innerCells,
	      primaryLineWidth: grid.primaryLineWidth,
	      secondaryLineWidth: grid.secondaryLineWidth
	    });

	    floor.mesh.pos = [
	      [x0, 0],
	      [x1, 0]
	    ];
	  }
	}

	var Tracker_1 = Tracker$1;

	class Floor$1 {
	  constructor(args = {}) {
	    if (args.scene == null) {
	      throw new Error("scene required");
	    }
	    const scene = this.scene = args.scene;
	    const mesh = this.mesh = scene.addMesh();
	    mesh.pos = [
	      [-10, 0],
	      [10, 0]
	    ];
	    mesh.lines = [
	      [0, 1]
	    ];

	    mesh.lineShader.renderLine = Floor$1.makeFloorLineShaderFunction({
	      width: args.width,
	      color: args.color
	    });

	    mesh.pointShader.renderPoint = () => {};

	    mesh.setCustomAttribute("translation", [0, 0]);
	  }

	  static makeFloorLineShaderFunction(args = {}) {
	    const width = args.width ?? 0.055;
	    const color = args.color ?? "black";
	    return (args) => {
	      const ctx = args.ctx;
	      const a = args.a;
	      const b = args.b;
	      const camera = args.camera;
	      const mesh = args.mesh;
	      const scale = camera.inferScale();

	      const _translation = mesh.getCustomAttribute("translation");
	      const translation = [scale * _translation[0], scale * _translation[1]];

	      ctx.strokeStyle = color;
	      ctx.lineWidth = scale * width;
	      ctx.beginPath();
	      ctx.moveTo(a[0] + translation[0], a[1] + translation[1]);
	      ctx.lineTo(b[0] + translation[0], b[1] + translation[1]);
	      ctx.stroke();
	    }
	  }
	}

	var Floor_1 = Floor$1;

	const mm2d$2 = mm2d$3;

	function renderCircle(ctx, scale, p, radius, borderWidth, borderColor, fillColor) {
	  const radius1 = (radius + borderWidth * 0.5) * scale;

	  ctx.fillStyle = fillColor;
	  ctx.beginPath();
	  ctx.arc(p[0], p[1], radius1, 0, 2 * Math.PI);
	  ctx.fill();

	  ctx.lineWidth = borderWidth * scale;
	  ctx.strokeStyle = borderColor;
	  ctx.stroke();
	}

	class VertexRenderer$1 {
	  constructor(args = {}) {
	    this.system = args.system;
	    this.renderVertexIds = args.renderVertexIds ?? false;
	    this.radius = args.radius ?? 0.028;
	    this.borderColor = args.borderColor ?? "black";
	    this.fillColor = args.fillColor ?? "white";
	    this.borderWidth = args.borderWidth ?? 0.023;
	  }

	  renderVertex(args = {}) {
	    const radius = this.radius;
	    const borderColor = this.borderColor;
	    const fillColor = this.fillColor;
	    const borderWidth = this.borderWidth;
	  
	    const ctx = args.ctx;
	    const p = args.p;
	    const camera = args.camera;
	    const scale = camera.inferScale();
	    
	    renderCircle(ctx, scale, p, radius, borderWidth, borderColor, fillColor);

	    if (this.renderVertexIds) {
	      ctx.beginPath();
	      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
	      ctx.arc(p[0], p[1], 0.1 * scale, 0, 2 * Math.PI);
	      ctx.fill();
	      
	      const fontSize = Math.floor(0.15 * scale);
	      ctx.font = `${fontSize}px monospace`;
	      ctx.fillStyle = "black";
	      ctx.textAlign = "center";
	      ctx.textBaseline = "middle";
	      ctx.fillText(args.id, p[0], p[1]);
	    }
	  }

	  getVertexPos(i) {
	    const pF32 = this.system.pos.slot.f32();
	    const offset = i * this.system.spaceDim;
	    return [pF32[offset], pF32[offset + 1]];
	  }

	  get numVertices() {
	    return this.system.numVertices;
	  }

	  hitTest(p, hitTestRadius = 0.31) {
	    const numVertices = this.numVertices;
	    if (numVertices == 0) return null;
	    let closestVertexId = null;
	    let closestQuadrance = Infinity;
	    const hitTestRadius2 = hitTestRadius * hitTestRadius;
	    for (let i = 0; i < numVertices; i++) {
	      const pi = this.getVertexPos(i);
	      const d = mm2d$2.math.Vec2.sub(pi, p);
	      const q = mm2d$2.math.Vec2.quadrance(d);
	      if (q < hitTestRadius2 && q < closestQuadrance) {
	        closestVertexId = i;
	        closestQuadrance = q;
	      }
	    }
	    return closestVertexId;
	  }

	  setVertexPos(i, p) {
	    if (i == null) throw new Error("vertex id required");
	    const system = this.system;
	    const pF32 = system.pos.slot.f32();
	    const offset = i * 2;
	    pF32[offset] = p[0];
	    pF32[offset + 1] = p[1];
	  }

	  setVertexVel(i, v) {
	    const system = this.system;
	    const vF32 = system.vel.slot.f32();
	    const offset = i * 2;
	    vF32[offset] = v[0];
	    vF32[offset + 1] = v[1];
	  }
	}

	var VertexRenderer_1 = VertexRenderer$1;

	function renderLine(ctx, scale, a, b, borderWidth, borderColor) {
	  ctx.beginPath();
	  ctx.lineJoin = "round";
	  ctx.lineCap = "round";
	  ctx.strokeStyle = borderColor;
	  ctx.lineWidth = borderWidth * scale;
	  ctx.moveTo(a[0], a[1]);
	  ctx.lineTo(b[0], b[1]);
	  ctx.closePath();
	  ctx.stroke();
	}

	function renderMuscle(ctx, scale, a, b, t, width, borderWidth, borderColor, color0, color1) {
	  ctx.beginPath();
	  ctx.lineCap = "butt";
	  ctx.strokeStyle = borderColor;
	  ctx.lineWidth = (width + borderWidth * 2) * scale;
	  ctx.moveTo(a[0], a[1]);
	  ctx.lineTo(b[0], b[1]);
	  ctx.stroke();

	  ctx.beginPath();
	  
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
	  ctx.lineWidth = width * scale;
	  ctx.moveTo(a[0], a[1]);
	  ctx.lineTo(b[0], b[1]);

	  ctx.stroke();
	}

	class LineRenderer$1 {
	  constructor(args = {}) {
	    this.system = args.system;
	  }

	  makeLineShaderFunction(args = {}) {
	    const activeMuscleColor = args.activeMuscleColor ?? [255, 0, 0];
	    const inactiveMuscleColor = args.inactiveMuscleColor ?? [0, 0, 255];
	    const borderColor = args.borderColor ?? "black";
	    
	    return (args = {}) => {
	      const ctx = args.ctx;
	      const a = args.a;
	      const b = args.b;
	      const camera = args.camera;
	      const scale = camera.inferScale();

	      const lineIdToMuscleId = args.mesh.getCustomAttribute("lineIdToMuscleId");
	      const muscleId = lineIdToMuscleId[args.id];
	      if (muscleId == null) {
	        const borderWidth = 0.029;
	        renderLine(ctx, scale, a, b, borderWidth, borderColor);
	      } else {
	        const color0 = activeMuscleColor;
	        const color1 = inactiveMuscleColor;
	        
	        const width = 0.065;
	        const borderWidth = 0.017;
	        const muscleIntensityAttributeName = "muscleIntensity";

	        const muscleIntensity = args.mesh.getCustomAttribute(muscleIntensityAttributeName);
	        if (muscleIntensity == null) {
	          throw new Error(`muscle intensity attribute (${muscleIntensityAttributeName}) not found, call setCustomAttribute("${muscleIntensityAttributeName}", value) before rendering.`);
	        }
	        if (!Array.isArray(muscleIntensity)) {
	          throw new Error(`muscle intensity attribute must be an array with values for each fiber, found ${typeof muscleIntensity}`);
	        }
	        
	        const t = muscleIntensity[muscleId];
	        renderMuscle(ctx, scale, a, b, t, width, borderWidth, borderColor, color0, color1);
	      }
	    }
	  }
	}

	var LineRenderer_1 = LineRenderer$1;

	const mm2d$1 = mm2d$3;
	const Tracker = Tracker_1;
	const Floor = Floor_1;
	const VertexRenderer = VertexRenderer_1;
	const LineRenderer = LineRenderer_1;

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

	function hexToRgb(hex) {
	  if (hex.length != 7) {
	    throw new Error(`invalid hex string ${hex}`);
	  }
	  if (hex[0] != "#") {
	    throw new Error(`invalid hex string ${hex}, expected #, found ${hex[0]}`);
	  }
	  hex = hex.substring(1);
	  const r = parseInt(hex.substring(0, 2), 16);
	  const g = parseInt(hex.substring(2, 4), 16);
	  const b = parseInt(hex.substring(4, 6), 16);
	  return [r, g, b];
	}

	class SystemViewport {
	  constructor(args = {}) {
	    if (args.system == null) {
	      throw new Error("system required");
	    }
	    this.system = args.system;
	    const sortedVertexIds = args.sortedVertexIds;
	    this.sortedVertexIds = sortedVertexIds;
	    if (args.vertexDepths != null) {
	      this.setSortedVertexIdsFromVertexDepths(args.vertexDepths);
	    }

	    const headless = args.headless ?? false;

	    const borderColor = args.borderColor ?? "black";
	    const floorColor = borderColor;
	    const fillColor = args.fillColor ?? "white";
	    const gridColor = args.gridColor ?? "#acadad";

	    this.vertices = new VertexRenderer({
	      system: this.system,
	      renderVertexIds: args.renderVertexIds ?? false,
	      borderColor: borderColor,
	      fillColor: fillColor
	    });
	    this.lines = new LineRenderer({
	      system: this.system
	    });

	    const renderer = new mm2d$1.Renderer({ headless });
	    this.renderer = renderer;
	    this.domElement = renderer.domElement;
	    this.setSize({
	      width: args.width ?? 400,
	      height: args.height ?? 400
	    });

	    const scene = new mm2d$1.Scene();
	    this.scene = scene;

	    const camera = new mm2d$1.Camera();
	    this.camera = camera;
	    
	    let activeMuscleColor = args.activeMuscleColor ?? [255, 0, 0];
	    let inactiveMuscleColor = args.inactiveMuscleColor ?? [250, 190, 190];
	    if (typeof activeMuscleColor === "string") {
	      activeMuscleColor = hexToRgb(activeMuscleColor);
	    }
	    if (typeof inactiveMuscleColor === "string") {
	      inactiveMuscleColor = hexToRgb(inactiveMuscleColor);
	    }

	    let backgroundCenterColor, backgroundOuterColor;
	    if (args.backgroundColor != null) {
	      backgroundCenterColor = args.backgroundColor;
	      backgroundOuterColor = args.backgroundColor;
	    } else {
	      backgroundCenterColor = args.backgroundCenterColor ?? "#fcfcfc";
	      backgroundOuterColor = args.backgroundOuterColor ?? "#d7d8d8";
	    }

	    new mm2d$1.background.Background({
	      scene: scene,
	      color1: backgroundCenterColor,
	      color2: backgroundOuterColor
	    });

	    const gridInnerCells = 2;
	    const gridPrimaryLineWidth = 0.022;
	    const gridSecondaryLineWidth = 0.005;
	    const grid = this.grid = new mm2d$1.background.Grid({
	      scene: scene,
	      x0: -3,
	      y0: 0,
	      rows: 4,
	      cols: 10,

	      innerCells: gridInnerCells,
	      primaryLineWidth: gridPrimaryLineWidth,
	      secondaryLineWidth: gridSecondaryLineWidth,
	      color: gridColor
	    });

	    // TODO this should not be necessary if grid.set used previously assigned attributes
	    grid.innerCells = gridInnerCells;
	    grid.primaryLineWidth = gridPrimaryLineWidth;
	    grid.secondaryLineWidth = gridSecondaryLineWidth;
	    // grid.color = gridColor;

	    this.floor = new Floor({
	      scene: scene,
	      color: floorColor
	    });

	    const mesh = scene.addMesh();
	    this.mesh = mesh;
	    
	    mesh.pointShader.renderPoint = (args) => { this.vertices.renderVertex(args); };

	    mesh.triangleShader.renderTriangle = (args = {}) => {
	      const ctx = args.ctx;
	      const a = args.a;
	      const b = args.b;
	      const c = args.c;

	      ctx.beginPath();
	      ctx.fillStyle = fillColor;
	      ctx.moveTo(...a);
	      ctx.lineTo(...b);
	      ctx.lineTo(...c);
	      ctx.closePath();
	      ctx.fill();
	    };
	    mesh.lineShader.renderLine = this.lines.makeLineShaderFunction({
	      activeMuscleColor: activeMuscleColor,
	      inactiveMuscleColor: inactiveMuscleColor,
	      borderColor: borderColor
	    });

	    const draggable = args.draggable ?? true;
	    if (draggable) {
	      const dragBehavior = this.dragBehavior = new mm2d$1.ui.DragBehavior({
	        onDomCursorDown: (domCursor, event) => {
	          if ("button" in event && event.button != 0) return;
	          const system = this.system;
	          const worldCursor = camera.domToWorldSpace(domCursor);
	          const vertexId = this.hitTestVertex(worldCursor);
	          if (vertexId != null) {
	            this.fixVertex(vertexId);
	            dragBehavior.beginDrag();
	            this.setVertexPos(
	              system.vertices.fixedVertexId,
	              [worldCursor[0], Math.max(0, worldCursor[1])]
	            );
	          }
	        },
	        onDragProgress: (domCursor) => {
	          const system = this.system;
	          const worldCursor = camera.domToWorldSpace(domCursor);
	          this.setVertexPos(
	            system.vertices.fixedVertexId,
	            [worldCursor[0], Math.max(0, worldCursor[1])]
	          );
	        },
	        onDomCursorUp: () => {
	          this.freeVertex();
	        }
	      });
	      if (!headless) {
	        const domElementForMoveEvents = args.domElementForMoveEvents ?? null;
	        dragBehavior.linkToDom(renderer.domElement, domElementForMoveEvents);
	      }
	    }
	    
	    this.tracker = new Tracker();
	  }

	  setSortedVertexIdsFromVertexDepths(depths) {
	    if (depths.length != this.system.numVertices) {
	      throw new Error(`invalid size for depths, found ${depths.length}, expected ${this.system.numVertices}`);
	    }
	    const indexedDepths = depths.map((depth, index) => ({ depth, index }));
	    indexedDepths.sort((a, b) => b.depth - a.depth);
	    const sortedVertexIds = indexedDepths.map((a) => a.index);
	    this.sortedVertexIds = sortedVertexIds;
	  }

	  setSize(args = {}) {
	    this.renderer.setSize({
	      width: args.width,
	      height: args.height
	    });
	  }

	  render() {
	    if (this.needsMeshUpdate == null || this.needsMeshUpdate) {
	      this._updateMesh({
	        triangles: this.system.getTrianglesArray(),
	        muscles: this.system.getMusclesArray()
	      });
	      this.needsMeshUpdate = false;
	    }

	    const renderer = this.renderer;
	    const scene = this.scene;
	    const camera = this.camera;
	    const mesh = this.mesh;

	    this._updateFromSystem();

	    if (this.dragBehavior == null || !this.dragBehavior.dragging()) {
	      this.tracker.step({
	        mesh: mesh,
	        camera: camera,
	        floor: this.floor,
	        grid: this.grid,
	        renderer: this.renderer
	      });
	    }
	    
	    renderer.render(scene, camera);
	  }

	  _updateMesh(meshData) {
	    const mesh = this.mesh;
	    const numVertices = this.system.numVertices;
	    if (!Number.isInteger(numVertices) || numVertices < 0) {
	      throw new Error(`invalid number of vertices ${numVertices}`);
	    }

	    if (meshData.pos != null) {
	      mesh.pos = meshData.pos;
	    }

	    mesh.triangles = meshData.triangles;
	    mesh.lines = edgesFromTriangles(meshData.triangles);
	    Array.prototype.push.apply(mesh.lines, meshData.muscles);

	    const muscleHashToId = new Map();
	    meshData.muscles.forEach((m, i) => {
	      muscleHashToId.set(
	        hashSimplex(m),
	        i
	      );
	    });
	    
	    const lineIdToMuscleId = [];
	    mesh.setCustomAttribute("lineIdToMuscleId", lineIdToMuscleId);
	    mesh.lines.forEach(line => {
	      const h = hashSimplex(line);
	      const muscleId = muscleHashToId.get(h);
	      lineIdToMuscleId.push(muscleId);
	    });
	    
	    let sortedVertexIds = this.sortedVertexIds;
	    if (sortedVertexIds == null) {
	      sortedVertexIds = [];
	      for (let i = 0; i < numVertices; i++) {
	        sortedVertexIds.push(i);
	      }
	    }
	    if (sortedVertexIds.length != numVertices) {
	      throw new Error(`invalid size for sortedVertexIds, found ${sortedVertexIds.length}, expected ${numVertices}`);
	    }

	    mesh.sortedElements = mm2d$1.sorted.makeSortedElements({
	      sortedVertexIds: sortedVertexIds,
	      triangles: mesh.triangles,
	      edges: mesh.lines
	    });

	    const muscleIntensity = [];
	    const numMuscles = this.system.numMuscles;
	    for (let i = 0; i < numMuscles; i++) {
	      muscleIntensity.push(1);
	    }
	    mesh.setCustomAttribute("muscleIntensity", muscleIntensity);
	  }

	  _updateFromSystem() {
	    this._updateVertexPositionsFromSystem();
	    this._updateMuscleIntensityFromSystem();
	  }

	  _updateVertexPositionsFromSystem() {
	    const mesh = this.mesh;
	    const system = this.system;

	    if (system.numVertices == 0) {
	      mesh.pos = [];
	    } else {
	      const pos = system.pos.toArray();
	      mesh.pos = pos;
	    }
	  }

	  _updateMuscleIntensityFromSystem() {
	    const mesh = this.mesh;
	    const system = this.system;
	    const numMuscles = system.numMuscles;

	    if (!Number.isInteger(numMuscles) || numMuscles < 0) {
	      throw new Error(`invalid number of muscles ${numMuscles}`);
	    }

	    let muscleIntensity = [];
	    
	    if (numMuscles > 0) {
	      if (system.a) {
	        const aF32 = system.a.slot.f32();
	        for (let i = 0; i < numMuscles; i++) {
	          muscleIntensity.push(aF32[i]);
	        }
	      } else {
	        muscleIntensity = new Array(numMuscles).fill(1);
	      }
	    }
	    
	    mesh.setCustomAttribute("muscleIntensity", muscleIntensity);
	  }

	  hitTestVertex(p, hitTestRadius = 0.31) {
	    return this.vertices.hitTest(p, hitTestRadius);
	  }

	  setVertexPos(i, p) {
	    this.vertices.setVertexPos(i, p);
	  }

	  setVertexVel(i, p) {
	    this.vertices.setVertexVel(i, p);
	  }

	  fixVertex(vertexId) {
	    const system = this.system;
	    this.setVertexVel(vertexId, [0, 0]);
	    if (vertexId == null) {
	      vertexId = -1;
	    }
	    system.vertices.fixVertex(vertexId);
	  }

	  freeVertex() {
	    const system = this.system;
	    system.vertices.freeVertex();
	  }
	}

	var SystemViewport_1 = SystemViewport;

	var render$1 = {
	  SystemViewport: SystemViewport_1,
	  VertexRenderer: VertexRenderer_1,
	  Tracker: Tracker_1,
	};

	const System = System_1;
	const Vertices = Vertices_1;

	const mmgrten = mmgrten$2;
	const render = render$1;
	const mm2d = mm2d$3;

	var algovivo = {
	  System: System,
	  Vertices: Vertices,
	  mmgrten: mmgrten,
	  SystemViewport: render.SystemViewport,
	  mm2d: mm2d,
	  render: render
	};

	var index = /*@__PURE__*/getDefaultExportFromCjs(algovivo);

	return index;

}));
