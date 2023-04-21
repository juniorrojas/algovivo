const Slot = require("./Slot");

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

module.exports = FreeSlot;