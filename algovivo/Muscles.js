class Muscles {
  constructor(args = {}) {
    const ten = args.ten;
    if (ten == null) throw new Error("ten required");
    this.ten = ten;

    this.indices = null;
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
    if (this.indices == null) return 0;
    return this.indices.numel / 2;
  }

  set(args = {}) {
    if (args.indices == null) {
      throw new Error("indices required");
    }
    const indices = args.indices;
    const numMuscles = indices.length;
    const numMuscles0 = this.numMuscles;

    const ten = this.ten;

    if (args.k != null) this.k = args.k;

    if (this.indices != null) this.indices.dispose();
    this.indices = ten.zeros([numMuscles * 2], "int32");

    const musclesU32 = this.indices.typedArray();
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
        const pos = args.pos;
        if (pos == null) {
          throw new Error("pos required to compute l0");
        }
        if (pos.ptr == null) {
          throw new Error("pos.ptr not available");
        }
        this.wasmInstance.exports.l0_of_pos(
          this.numVertices,
          pos.ptr,
          numMuscles,
          this.indices.ptr,
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

  toStepArgs() {
    const numMuscles = this.numMuscles;
    return [
      numMuscles,
      numMuscles == 0 ? 0 : this.indices.ptr,
      this.k,
      numMuscles == 0 ? 0 : this.a.ptr,
      numMuscles == 0 ? 0 : this.l0.ptr
    ];
  }

  dispose() {
    if (this.indices != null) {
      this.indices.dispose();
      this.indices = null;
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

module.exports = Muscles;