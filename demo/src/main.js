import algovivo from "../../build/algovivo.mjs";
import BrainButton from "./BrainButton.js";
import { initStyle } from "./ui.js";
import AgentViewport from "./AgentViewport.js";
import Sections from "./Sections.js";
import Header from "./Header.js";

async function loadWasm() {
  const response = await fetch("algovivo.wasm");
  const wasm = await WebAssembly.instantiateStreaming(response);
  return wasm.instance;
}

const dataRoot = "data";
const agentNames = ["biped", "quadruped"];

async function main() {
  initStyle();
  
  const header = new Header();
  document.body.appendChild(header.domElement);

  const divContent = document.createElement("div");
  divContent.style.display = "flex";
  divContent.style.flexDirection = "column";
  divContent.style.alignItems = "center";
  divContent.style.width = "100%";
  document.body.appendChild(divContent);

  document.documentElement.style.height = "100%";
  document.body.style.height = "100%";
  document.body.style.display = "flex";
  document.body.style.flexDirection = "column";
  document.body.style.margin = 0;
  document.body.style.padding = 0;
  document.body.style.alignItems = "center";

  const wasmInstance = await loadWasm();
  const system = new algovivo.System({
    wasmInstance: wasmInstance
  });

  const agentViewport = new AgentViewport({
    system: system,
    algovivo: algovivo,
    dataRoot: dataRoot,
    agentNames: agentNames
  });
  divContent.appendChild(agentViewport.domElement);

  await agentViewport.preloadMiniButtonData();
  await agentViewport.switchToAgent("biped");

  const btnBrain = new BrainButton();
  btnBrain.domElement.style.marginTop = "8px";
  btnBrain.domElement.style.marginBottom = "16px";
  btnBrain.domElement.addEventListener("click", () => {
    const isActive = agentViewport.togglePolicy();
    if (isActive) btnBrain.setActiveStyle();
    else btnBrain.setInactiveStyle();
  });
  divContent.appendChild(btnBrain.domElement);

  const sections = new Sections();
  divContent.appendChild(sections.domElement);

  agentViewport.render();
  setInterval(() => {
    if (agentViewport.agentManager.policy != null) {
      agentViewport.agentManager.policy.step();
    }
    system.step();
    agentViewport.render();
  }, 1000 / 30);

  window.system = system;
}

main();