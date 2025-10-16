import AgentMini from "./AgentMini.js";
import AgentManager from "./AgentManager.js";

export default class AgentViewportWithMenu {
  constructor({ system, algovivo, dataRoot = "data", agentNames = [], headless = false }) {
    this.system = system;
    this.agentManager = new AgentManager(system, algovivo, dataRoot, agentNames);
    this.viewport = null;
    this.algovivo = algovivo;
    
    this.headless = headless;
    if (!headless) {
      this.initContainer();
      this.initMiniButtons(algovivo);
    }
  }

  initContainer() {
    this.domElement = document.createElement("div");
    this.domElement.style.position = "relative";
    this.domElement.style.display = "inline-block";
    this.domElement.style.borderRadius = "10px";
    this.domElement.style.border = "2px solid #c9c9c9";
    this.domElement.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.1)";
    this.domElement.style.overflow = "hidden";
    this.initResponsiveSize();
  }

  initResponsiveSize() {
    const mq = window.matchMedia("(max-width: 410px)");
    const updateSize = () => {
      const size = mq.matches ? { width: 300, height: 350 } : { width: 400, height: 400 };
      this.domElement.style.width = `${size.width}px`;
      this.domElement.style.height = `${size.height}px`;
      if (this.viewport) {
        this.viewport.setSize(size);
      }
    };
    mq.addEventListener("change", updateSize);
    updateSize();
  }

  initMiniButtons(algovivo) {
    this.miniContainer = document.createElement("div");
    this.miniContainer.style.position = "absolute";
    this.miniContainer.style.top = "14px";
    this.miniContainer.style.right = "14px";
    this.miniContainer.style.zIndex = "10";
    this.miniContainer.style.display = "flex";
    this.miniContainer.style.flexDirection = "column";
    this.miniContainer.style.gap = "8px";
    
    this.miniButtons = {};
    
    this.agentManager.agents.forEach(agentName => {
      this.miniButtons[agentName] = new AgentMini({
        mm2d: algovivo.mm2d,
        pos: [],
        triangles: [],
        muscles: [],
        size: 40
      });
      this.miniButtons[agentName].domElement.style.cursor = "pointer";
      this.miniButtons[agentName].domElement.addEventListener("click", () => {
        this.switchToAgent(agentName);
      });
      this.miniContainer.appendChild(this.miniButtons[agentName].domElement);
    });
    
    this.domElement.appendChild(this.miniContainer);
  }

  async preloadMiniButtonData() {
    await this.agentManager.preloadAllData();
    
    for (const agentName of this.agentManager.agents) {
      try {
        const meshData = this.agentManager.meshCache.get(agentName);
        if (this.miniButtons[agentName] && meshData) {
          this.miniButtons[agentName].updateMesh({
            pos: meshData.pos,
            triangles: meshData.triangles
          });
        }
      } catch (error) {
        console.warn(`Failed to preload mesh data for ${agentName}:`, error);
      }
    }
  }

  async switchToAgent(agentName) {
    if (this.agentManager.getCurrentAgent() === agentName) return;

    try {
      const { meshData } = await this.agentManager.switchToAgent(agentName);
      
      if (this.viewport) {
        this.viewport.needsMeshUpdate = true;
        if (meshData.depth != null) {
          this.viewport.setSortedVertexIdsFromVertexDepths(meshData.depth);
        } else if (meshData.sorted_vertex_ids != null) {
          this.viewport.sortedVertexIds = meshData.sorted_vertex_ids;
        }
      } else {
        this.viewport = new this.algovivo.render.SystemViewport({
          system: this.system,
          sortedVertexIds: meshData.sorted_vertex_ids,
          vertexDepths: meshData.depth,
          domElementForMoveEvents: this.domElement
        });
        this.viewport.tracker.targetCenterY = 1.1;
        this.domElement.insertBefore(this.viewport.domElement, this.miniContainer);
        this.initResponsiveSize();
      }

      this.updateMiniButtonStates(agentName);
      
    } catch (error) {
      console.error(`Failed to switch to agent ${agentName}:`, error);
    }
  }

  updateMiniButtonStates(activeAgent) {
    Object.keys(this.miniButtons).forEach(agentName => {
      const button = this.miniButtons[agentName];
      button.setActive(agentName === activeAgent);
    });
  }

  togglePolicy() {
    return this.agentManager.togglePolicy();
  }

  render() {
    if (this.viewport) {
      this.viewport.render();
    }
  }

  dispose() {
    this.agentManager.dispose();
  }

  getCurrentAgent() {
    return this.agentManager.getCurrentAgent();
  }

  isActive() {
    return this.agentManager.isActive();
  }
}
