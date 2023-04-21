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
    const ReservedSlot = require("./ReservedSlot");
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
    const FreeSlot = require("./FreeSlot");
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

module.exports = Slot;