const Slot = require("./Slot");

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

module.exports = ReservedSlot;