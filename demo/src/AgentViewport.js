import AgentMini from "./AgentMini.js";
import AgentManager from "./AgentManager.js";

export default class AgentViewport {
  constructor({ system, algovivo, dataRoot = "data", agentNames = [], headless = false }) {
    this.system = system;
    this.agentManager = new AgentManager(system, algovivo, dataRoot, agentNames);
    this.viewport = null;
    this.algovivo = algovivo;
    this.overlayFractionRight = 0;
    this.reservedBottom = 0;
    this.fullscreen = false;

    this.headless = headless;
    if (!headless) {
      this.initContainer();
      this.initMiniButtons(algovivo);
    }
  }

  initContainer() {
    this.domElement = document.createElement("div");
    this.domElement.style.position = "relative";
    this.domElement.style.display = "block";
    this.domElement.style.width = "100%";
    this.domElement.style.overflow = "hidden";
    this.initResponsiveSize();
  }

  initResponsiveSize() {
    const pxPerWorldUnit = 400 / 3.4;
    const minWorldHeight = 3.4;
    const minWorldWidth = 4;
    let lastWidth = null;
    let lastHeight = null;

    const updateSize = (force = false) => {
      const width = this.domElement.clientWidth;
      if (width === 0) return;
      const height = this.fullscreen
        ? window.innerHeight
        : Math.max(300, Math.min(460, Math.round(width * 0.55)));

      if (height !== lastHeight) this.domElement.style.height = `${height}px`;
      const changed = width !== lastWidth || height !== lastHeight;
      lastWidth = width;
      lastHeight = height;
      if (!changed && !force) return;

      if (this.onResize != null) this.onResize({ width, height });

      if (this.viewport) {
        this.viewport.setSize({ width, height });

        // the camera only takes a visible width, so a short viewport is widened
        // until minWorldHeight fits, rather than cropping the world vertically
        const worldWidth = this.fullscreen
          ? Math.max(minWorldWidth, minWorldHeight * width / height)
          : Math.max(width / pxPerWorldUnit, minWorldHeight * width / height);
        const scale = width / worldWidth;
        const worldHeight = height / scale;

        this.viewport.tracker.visibleWorldWidth = worldWidth;
        this.viewport.tracker.offsetX = 0.5 * this.overlayFractionRight * worldWidth;
        this.viewport.tracker.targetCenterY = Math.min(
          0.75,
          worldHeight / 2 - this.reservedBottom / scale
        );
        this.viewport.render();
      }
    };

    this.updateSize = updateSize;
    if (this.resizeObserver == null) {
      this.resizeObserver = new ResizeObserver(() => updateSize());
      this.resizeObserver.observe(this.domElement);
    }
    updateSize();
  }

  initMiniButtons(algovivo) {
    this.miniContainer = document.createElement("div");
    this.miniContainer.style.position = "absolute";
    this.miniContainer.style.top = "14px";
    this.miniContainer.style.left = "14px";
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
        this.viewport.tracker.targetCenterY = 0.75;
        this.domElement.insertBefore(this.viewport.domElement, this.miniContainer);
        this.initResponsiveSize();
      }

      this.updateMiniButtonStates(agentName);

      if (this.onAgentChange != null) this.onAgentChange(agentName);
      
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
