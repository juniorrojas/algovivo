export default class AgentManager {
  constructor(system, algovivo, dataRoot = "data") {
    this.system = system;
    this.algovivo = algovivo;
    this.dataRoot = dataRoot;
    this.currentAgent = null;
    this.policy = null;
    this.agents = ["quadruped", "biped"];
    this.meshCache = new Map();
    this.policyCache = new Map();
  }

  async loadMeshData(agentType) {
    if (this.meshCache.has(agentType)) {
      return this.meshCache.get(agentType);
    }
    const response = await fetch(`${this.dataRoot}/${agentType}/mesh.json`);
    const data = await response.json();
    this.meshCache.set(agentType, data);
    return data;
  }

  async loadPolicyData(agentType) {
    if (this.policyCache.has(agentType)) {
      return this.policyCache.get(agentType);
    }
    const response = await fetch(`${this.dataRoot}/${agentType}/policy.json`);
    const data = await response.json();
    this.policyCache.set(agentType, data);
    return data;
  }

  async preloadAllData() {
    await Promise.all(
      this.agents.map(agentType => 
        Promise.all([
          this.loadMeshData(agentType),
          this.loadPolicyData(agentType)
        ])
      )
    );
  }

  async switchToAgent(agentType) {
    if (this.currentAgent === agentType) return;

    const [meshData, policyData] = await Promise.all([
      this.loadMeshData(agentType),
      this.loadPolicyData(agentType)
    ]);

    // recenter mesh to avoid camera jump
    let processedPos = meshData.pos;
    if (this.policy !== null && this.policy.centerVertexId != null) {
      const currentCenterPos = this.system.vertices.getVertexPos(this.policy.centerVertexId);
      const newCenterPos = meshData.pos[policyData.center_vertex_id];
      const offsetX = currentCenterPos[0] - newCenterPos[0];
      
      processedPos = meshData.pos.map(vertexPos => [
        vertexPos[0] + offsetX,
        vertexPos[1]
      ]);
    }

    const activePolicy = this.policy ? this.policy.active : false;
    this.dispose();

    this.system.set({
      pos: processedPos,
      muscles: meshData.muscles,
      musclesL0: meshData.l0,
      triangles: meshData.triangles,
      trianglesRsi: meshData.rsi
    });

    this.policy = new this.algovivo.nn.NeuralFramePolicy({
      system: this.system,
      stochastic: true,
      active: activePolicy
    });
    this.policy.loadData(policyData);

    this.currentAgent = agentType;
    
    return { meshData, policyData };
  }

  dispose() {
    if (this.policy != null) {
      this.policy.dispose();
      this.policy = null;
    }
    this.system.dispose();
  }

  togglePolicy() {
    if (this.policy) {
      this.policy.active = !this.policy.active;
      return this.policy.active;
    }
    return false;
  }

  getCurrentAgent() {
    return this.currentAgent;
  }

  isActive() {
    return this.policy && this.policy.active;
  }
}
