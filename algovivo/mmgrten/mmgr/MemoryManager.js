const linked = require("./linked");
const FreeSlot = require("./FreeSlot");

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

module.exports = MemoryManager;