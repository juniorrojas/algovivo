// const mmgr = require("./mmgr");

class IntTuple {
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
    if (b instanceof IntTuple) {
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

module.exports = IntTuple;