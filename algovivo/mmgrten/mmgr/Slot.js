export default class Slot {
  constructor(args = {}) {
    this.memoryManager = args.memoryManager;
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
    return this.memoryManager._appendReservedSlot(this, ptr, size);
  }

  appendFree(ptr, size) {
    return this.memoryManager._appendFreeSlot(this, ptr, size);
  }

  remove() {
    this.node.remove();
    this.node.data = null;
    this.node = null;
    if (this.isFree()) {
      this.memoryManager._removeFreeSlot(this);
      this.freeNode = null;
    } else {
      this.memoryManager._removeReservedSlot(this);
      this.reservedNode = null;
    }
  }

  toTypedArray(ArrayClass) {
    const bytes = this.size;
    const bytesPerElement = ArrayClass.BYTES_PER_ELEMENT;
    if (bytes % bytesPerElement != 0) {
      throw new Error(`size in bytes must be a multiple of ${bytesPerElement}, found ${bytes}`);
    }
    const start = this.ptr;
    return new ArrayClass(
      this.memoryManager.array,
      start,
      bytes / bytesPerElement
    );
  }

  f32() {
    return this.toTypedArray(Float32Array);
  }

  i32() {
    return this.toTypedArray(Int32Array);
  }

  u32() {
    return this.toTypedArray(Uint32Array);
  }
}
