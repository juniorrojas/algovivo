import * as algovivo from "../../build/algovivo.js";
import BrainButton from "./BrainButton.js";
import { initStyle } from "./ui.js";
import AgentViewport from "./AgentViewport.js";
import CodeSnippet from "./CodeSnippet.js";
import Header from "./Header.js";
import Sections from "./Sections.js";
import Footer from "./Footer.js";

async function loadWasm() {
  const response = await fetch("algovivo.wasm");
  const wasm = await WebAssembly.instantiateStreaming(response);
  return wasm.instance;
}

const dataRoot = "data";
const agentNames = ["biped", "quadruped"];
const maxContentWidth = 1200;

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

  const codeSnippet = new CodeSnippet({ collapsed: window.innerWidth < 640 });

  const divSim = document.createElement("div");
  divSim.style.width = "100%";
  divContent.appendChild(divSim);
  divSim.appendChild(agentViewport.domElement);

  const snippetElement = codeSnippet.domElement;
  snippetElement.style.zIndex = "5";
  agentViewport.domElement.appendChild(snippetElement);

  await agentViewport.preloadMiniButtonData();
  await agentViewport.switchToAgent("biped");
  codeSnippet.setAgent(agentViewport.getCurrentAgent());

  agentViewport.onAgentChange = (agentName) => codeSnippet.setAgent(agentName);

  const btnBrain = new BrainButton();
  btnBrain.domElement.style.position = "absolute";
  btnBrain.domElement.style.bottom = "14px";
  btnBrain.domElement.style.transform = "translateX(-50%)";
  btnBrain.domElement.style.zIndex = "10";
  btnBrain.domElement.addEventListener("click", () => {
    const isActive = agentViewport.togglePolicy();
    if (isActive) btnBrain.setActiveStyle();
    else btnBrain.setInactiveStyle();
  });
  agentViewport.domElement.appendChild(btnBrain.domElement);

  agentViewport.onResize = ({ width, height }) => {
    // keep the overlaid controls inside the same column the header uses,
    // instead of letting them drift to the edges of a wide screen
    const contentWidth = Math.min(width, maxContentWidth);
    const inset = Math.max(14, Math.round((width - maxContentWidth) / 2));

    const panelWidth = codeSnippet.collapsed
      ? 74
      : Math.min(480, Math.max(240, Math.round(contentWidth * 0.46)));

    snippetElement.style.position = "absolute";
    snippetElement.style.top = "14px";
    snippetElement.style.right = `${inset}px`;
    snippetElement.style.bottom = codeSnippet.collapsed ? "" : "14px";
    snippetElement.style.width = `${panelWidth}px`;

    agentViewport.miniContainer.style.left = `${inset}px`;

    const occupiedWidth = codeSnippet.collapsed ? 0 : panelWidth + 14;
    const simWidth = width - occupiedWidth;
    agentViewport.overlayFractionRight = occupiedWidth / width;
    btnBrain.domElement.style.left = `${simWidth / 2}px`;

    const brainSize = Math.round(Math.max(22, Math.min(34, height * 0.072)));
    btnBrain.setSize(brainSize);
    agentViewport.reservedBottom = 2 * brainSize + 28;
  };
  codeSnippet.onToggle = () => agentViewport.updateSize(true);

  agentViewport.updateSize(true);

  const sections = new Sections();
  divContent.appendChild(sections.domElement);

  const footer = new Footer();
  document.body.appendChild(footer.domElement);

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