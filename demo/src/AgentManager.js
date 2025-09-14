export default class AgentManager {
  constructor(system, algovivo, dataRoot = "data", agentNames = []) {
    this.system = system;
    this.algovivo = algovivo;
    this.dataRoot = dataRoot;
    this.currentAgent = null;
    this.policy = null;
    this.agents = agentNames;
    this.meshCache = new Map();
    this.policyCache = new Map();
  }

  async loadMeshData(agentName) {
    if (this.meshCache.has(agentName)) {
      return this.meshCache.get(agentName);
    }
    const response = await fetch(`${this.dataRoot}/${agentName}/mesh.json`);
    const data = await response.json();
    this.meshCache.set(agentName, data);
    return data;
  }

  async loadPolicyData(agentName) {
    if (this.policyCache.has(agentName)) {
      return this.policyCache.get(agentName);
    }
    const response = await fetch(`${this.dataRoot}/${agentName}/policy.json`);
    const data = await response.json();
    this.policyCache.set(agentName, data);
    return data;
  }

  async preloadAllData() {
    await Promise.all(
      this.agents.map(agentName => 
        Promise.all([
          this.loadMeshData(agentName),
          this.loadPolicyData(agentName)
        ])
      )
    );
  }

  async switchToAgent(agentName) {
    if (this.currentAgent === agentName) return;

    const [meshData, policyData] = await Promise.all([
      this.loadMeshData(agentName),
      this.loadPolicyData(agentName)
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

    this.currentAgent = agentName;
    
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
