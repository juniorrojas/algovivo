class Vertices {
  constructor(args = {}) {
    const ten = args.ten;
    if (ten == null) throw new Error("ten required");
    this.ten = ten;
  }

  get wasmInstance() {
    return this.ten.wasmInstance;
  }

  get memoryManager() {
    return this.ten.mgr;
  }
}

module.exports = Vertices;