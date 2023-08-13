const mmgr = require("./mmgr");
const utils = require("./utils");
const Tensor = require("./Tensor");
const IntTuple = require("./IntTuple");
const Functional = require("./Functional");
const nn = require("./nn");

class Engine {
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
    })
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
    this.wasmInstance.exports.zero_(x.numel, x.ptr);
    return x;
  }
}

module.exports = Engine;