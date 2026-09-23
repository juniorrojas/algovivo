import AgentMini from "./AgentMini.js";

export default class AgentPicker {
  constructor(args = {}) {
    if (args.mm2d == null) throw new Error("mm2d required");
    const agentNames = args.agentNames ?? [];

    this.onSelect = null;

    const div = this.domElement = document.createElement("div");
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.gap = "8px";

    this.buttons = new Map();
    agentNames.forEach((agentName) => {
      const button = new AgentMini({ mm2d: args.mm2d, size: 40 });
      button.domElement.style.cursor = "pointer";
      button.domElement.addEventListener("click", () => {
        if (this.onSelect != null) this.onSelect(agentName);
      });
      div.appendChild(button.domElement);
      this.buttons.set(agentName, button);
    });
  }

  setMesh(agentName, mesh) {
    this.buttons.get(agentName).setMesh({
      pos: mesh.pos,
      triangles: mesh.triangles
    });
  }

  setActive(agentName) {
    this.buttons.forEach((button, name) => {
      button.setActive(name == agentName);
    });
  }
}
