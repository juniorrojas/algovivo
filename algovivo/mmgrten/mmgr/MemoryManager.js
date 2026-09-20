import * as linked from "./linked/index.js";
import FreeSlot from "./FreeSlot.js";
import ReservedSlot from "./ReservedSlot.js";

export default class MemoryManager {
  constructor(array, heapBase) {
    this.array = array;

    if (heapBase == null) heapBase = 0;
    else heapBase = Number(heapBase);

    this.ptrToSlot = new Map();

    this.slots = new linked.List();
    this.freeSlots = new linked.List();
    this.reservedSlots = new linked.List();

    const slot = new FreeSlot({
      memoryManager: this,
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

  _appendReservedSlot(prevSlot, ptr, size) {
    const node = prevSlot.node.append(null);
    const slot = new ReservedSlot({
      memoryManager: this,
      ptr: ptr,
      size: size,
      node: node
    });
    node.data = slot;
    this._addReservedSlot(slot);
    return slot;
  }

  _appendFreeSlot(prevSlot, ptr, size) {
    const node = prevSlot.node.append(null);
    const slot = new FreeSlot({
      memoryManager: this,
      ptr: ptr,
      size: size,
      node: node
    });
    node.data = slot;
    this._addFreeSlot(slot);
    return slot;
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
      throw new Error(`expected integer size, found ${size}`);
    }
    if (size < 0) {
      throw new Error(`expected non-negative size, found ${size}`);
    }
    let validFreeSlot = null;
    let largestFreeSlotSize = 0;
    const it = this.freeSlots.iter();
    let r = it.next();
    while (!r.done) {
      const freeSlot = r.value;
      if (freeSlot.size >= size) {
        validFreeSlot = freeSlot;
        break;
      }
      if (freeSlot.size > largestFreeSlotSize) {
        largestFreeSlotSize = freeSlot.size;
      }
      r = it.next();
    }
    if (validFreeSlot == null) {
      throw new Error(
        `no free slot available for ${size} bytes, ` +
        `largest free slot has ${largestFreeSlotSize} bytes`
      );
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
    if (slot == null) {
      throw new Error(`no slot found for ptr ${ptr}`);
    }
    this.ptrToSlot.delete(ptr);
    slot.free();
  }
}
