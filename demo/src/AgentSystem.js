export default class AgentSystem {
  constructor(args = {}) {
    if (args.algovivo == null) throw new Error("algovivo required");
    this.algovivo = args.algovivo;

    if (args.system == null) throw new Error("system required");
    this.system = args.system;

    this.policy = null;
  }

  set(args = {}) {
    const mesh = args.mesh;
    const policy = args.policy;

    if (mesh == null) throw new Error("mesh required");

    this.dispose();
    
    this.system.set(mesh);
    if (policy != null) {
      this.policy = new this.algovivo.nn.NeuralFramePolicy({ system: this.system });
      this.policy.loadData(policy);
    }
  }

  dispose() {
    if (this.policy != null) {
      this.policy.dispose();
      this.policy = null;
    }
    this.system.dispose();
  }
}