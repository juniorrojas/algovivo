function sampleNormal(mean, stdDev) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * stdDev;
}

export default class NeuralPolicy {
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

    const numVertices = system.numVertices;
    const numMuscles = system.numMuscles;
    const spaceDim = system.spaceDim;

    this.projectedPos = ten.zeros([numVertices, spaceDim]);
    this.projectedVel = ten.zeros([numVertices, spaceDim]);
    const inputSize = numVertices * spaceDim * 2;
    const outputSize = numMuscles;
    this.input = ten.zeros([inputSize]);

    const nn = ten.nn;
    this.model = nn.Sequential(
      nn.Linear(inputSize, 32),
      nn.ReLU(),
      nn.Linear(32, outputSize),
      nn.Tanh()
    );
  }

  step() {
    const system = this.system;
    const wasmInstance = this.ten.wasmInstance;

    const numVertices = system.numVertices;
    
    wasmInstance.exports.make_neural_policy_input(
      numVertices,
      system.pos.ptr,
      system.vel.ptr,
      this.centerVertexId,
      this.forwardVertexId,
      this.projectedPos.ptr,
      this.projectedVel.ptr,
      this.input.ptr
    );

    const da = this.model.forward(this.input);

    const minA = this.minA;
    const maxAbsDa = this.maxAbsDa;

    const a = this.system.a;
    const daF32 = da.slot.f32();
    
    const numMuscles = this.system.numMuscles;
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

    da.clamp_({ min: -maxAbsDa, max: maxAbsDa });

    const aF32 = a.slot.f32();
    for (let i = 0; i < numMuscles; i++) {
      aF32[i] += daF32[i];
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