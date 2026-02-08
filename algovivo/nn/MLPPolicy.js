function sampleNormal(mean, stdDev) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * stdDev;
}

class MLPPolicy {
  constructor(args = {}) {
    if (args.system == null) {
      throw new Error("system required to create policy");
    }
    this.system = args.system;
    this.ten = this.system.ten;

    this.active = args.active ?? false;
    this.stochastic = args.stochastic ?? false;
    this.stdDev = args.stdDev ?? 0.05;

    const system = this.system;
    const ten = this.ten;

    const numVertices = this.numVertices = args.numVertices ?? system.numVertices;
    const numMuscles = this.numMuscles = args.numMuscles ?? system.numMuscles;
    const spaceDim = system.spaceDim;

    this.vertexIdOffset = args.vertexIdOffset ?? 0;
    this.muscleIdOffset = args.muscleIdOffset ?? 0;

    this.projectedPos = ten.zeros([numVertices, spaceDim]);
    this.projectedVel = ten.zeros([numVertices, spaceDim]);
    const inputSize = numVertices * spaceDim * 2;
    const outputSize = numMuscles;
    this.input = ten.zeros([inputSize]);

    this.clockwise = false;

    const nn = ten.nn;
    this.model = nn.Sequential(
      nn.Linear(inputSize, 32),
      nn.ReLU(),
      nn.Linear(32, outputSize),
      nn.Tanh()
    );
  }

  get spaceDim() {
    return this.system.spaceDim;
  }

  step(args = {}) {
    const system = this.system;
    const wasmInstance = this.ten.wasmInstance;

    const bytesPerFloat = 4;
    const bytesOffset = this.vertexIdOffset * this.spaceDim * bytesPerFloat;
    
    wasmInstance.exports.make_neural_policy_input(
      this.numVertices,
      system.pos.ptr + bytesOffset,
      system.vel.ptr + bytesOffset,
      this.centerVertexId,
      this.forwardVertexId,
      this.projectedPos.ptr,
      this.projectedVel.ptr,
      this.input.ptr,
      this.clockwise
    );

    const da = this.model.forward(this.input);

    const minA = this.minA;
    const maxAbsDa = this.maxAbsDa;

    const a = this.system.a;
    const daF32 = da.slot.f32();
    
    const numMuscles = this.numMuscles;
    for (let i = 0; i < numMuscles; i++) {
      let dai;
      if (this.active) {
        dai = da.get([i]);
        if (this.stochastic) {
          dai += sampleNormal(0, this.stdDev);
        }
      } else {
        dai = 1;
      }
      daF32[i] = dai;
    }

    const trace = args.trace;
    
    if (trace != null) {
      trace.policyInput = this.input.toArray();
      trace.policyOutput = da.toArray();
    }

    da.clamp_({ min: -maxAbsDa, max: maxAbsDa });

    const aF32 = a.slot.f32();
    for (let i = 0; i < numMuscles; i++) {
      aF32[this.muscleIdOffset + i] += daF32[i];
    }

    a.clamp_({ min: minA, max: 1.0 });
  }

  loadData(data) {
    const fc1 = this.model.layers[0];
    fc1.weight.set(data.fc1.weight);
    fc1.bias.set(data.fc1.bias);
    const fc2 = this.model.layers[2];
    fc2.weight.set(data.fc2.weight);
    fc2.bias.set(data.fc2.bias);

    this.minA = data.min_a ?? (() => { throw new Error("min_a required") })();
    this.maxAbsDa = data.max_abs_da ?? (() => { throw new Error("max_abs_da required") })();
    this.centerVertexId = data.center_vertex_id ?? (() => { throw new Error("center_vertex_id required") })();
    this.forwardVertexId = data.forward_vertex_id ?? (() => { throw new Error("forward_vertex_id required") })();
  }

  dispose() {
    if (this.projectedPos != null) this.projectedPos.dispose();
    if (this.projectedVel != null) this.projectedVel.dispose();
    if (this.input != null) this.input.dispose();
    this.model.dispose();
  }
}

module.exports = MLPPolicy;