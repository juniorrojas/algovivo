export default class AgentSystem {
  constructor(args = {}) {
    if (args.algovivo == null) throw new Error("algovivo required");
    this.algovivo = args.algovivo;

    if (args.system == null) throw new Error("system required");
    this.system = args.system;

    this.agentName = null;
    this.policy = null;
  }

  get policyActive() {
    return this.policy != null && this.policy.active;
  }

  set policyActive(active) {
    if (this.policy != null) this.policy.active = active;
  }

  set(args = {}) {
    const mesh = args.mesh;
    const policy = args.policy;

    if (mesh == null) throw new Error("mesh required");

    this.dispose();

    this.system.set(mesh);
    if (policy != null) {
      this.policy = new this.algovivo.nn.MLPPolicy({ system: this.system });
      this.policy.loadData(policy);
    }
  }

  setAgent(agentName, data) {
    const mesh = data.mesh;
    const policy = data.policy;

    let pos = mesh.pos;
    if (this.policy != null && policy != null) {
      const currentCenter = this.system.vertices.getVertexPos(this.policy.centerVertexId);
      const newCenter = pos[policy.center_vertex_id];
      const offsetX = currentCenter[0] - newCenter[0];
      pos = pos.map((p) => [p[0] + offsetX, p[1]]);
    }

    const policyActive = this.policyActive;
    this.set({
      mesh: {
        pos: pos,
        muscles: mesh.muscles,
        musclesL0: mesh.l0,
        triangles: mesh.triangles,
        trianglesRsi: mesh.rsi
      },
      policy: policy
    });
    this.policyActive = policyActive;
    this.agentName = agentName;
  }

  step() {
    if (this.policy != null) this.policy.step();
    this.system.step();
  }

  dispose() {
    if (this.policy != null) {
      this.policy.dispose();
      this.policy = null;
    }
    this.system.dispose();
  }
}
