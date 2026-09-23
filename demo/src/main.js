import * as algovivo from "../../build/algovivo.js";
import BrainButton from "./BrainButton.js";
import { initStyle } from "./ui.js";
import AgentData from "./AgentData.js";
import AgentPicker from "./AgentPicker.js";
import AgentSystem from "./AgentSystem.js";
import AgentViewport from "./AgentViewport.js";
import CodeSnippet from "./CodeSnippet.js";
import FullscreenButton from "./FullscreenButton.js";
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

  const agentData = new AgentData({ dataRoot: dataRoot });

  const agentSystem = new AgentSystem({
    algovivo: algovivo,
    system: system
  });

  const agentViewport = new AgentViewport({
    algovivo: algovivo,
    system: system
  });

  const codeSnippet = new CodeSnippet({ collapsed: true });

  const divSim = document.createElement("div");
  divSim.style.width = "100%";
  divContent.appendChild(divSim);
  divSim.appendChild(agentViewport.domElement);

  const agentPicker = new AgentPicker({
    mm2d: algovivo.mm2d,
    agentNames: agentNames
  });
  agentPicker.domElement.style.position = "absolute";
  agentPicker.domElement.style.top = "14px";
  agentPicker.domElement.style.zIndex = "10";
  agentViewport.domElement.appendChild(agentPicker.domElement);

  const snippetElement = codeSnippet.domElement;
  snippetElement.style.zIndex = "5";
  agentViewport.domElement.appendChild(snippetElement);

  const btnFullscreen = new FullscreenButton({ target: agentViewport.domElement });
  btnFullscreen.domElement.style.position = "absolute";
  btnFullscreen.domElement.style.zIndex = "10";
  btnFullscreen.onChange = (fullscreen) => {
    agentViewport.fullscreen = fullscreen;
    agentViewport.updateSize(true);
  };
  if (FullscreenButton.supported()) {
    agentViewport.domElement.appendChild(btnFullscreen.domElement);
  }

  async function setAgent(agentName) {
    if (agentName == agentSystem.agentName) return;
    const data = await agentData.load(agentName);
    agentSystem.setAgent(agentName, data);
    agentViewport.setMesh(data.mesh);
    agentPicker.setActive(agentName);
    codeSnippet.setAgent(agentName);
  }

  agentPicker.onSelect = (agentName) => {
    setAgent(agentName).catch((error) => {
      console.error(`failed to set agent ${agentName}`, error);
    });
  };

  await Promise.all(agentNames.map(async (agentName) => {
    const data = await agentData.load(agentName);
    agentPicker.setMesh(agentName, data.mesh);
  }));
  await setAgent("biped");

  const btnBrain = new BrainButton();
  btnBrain.domElement.style.position = "absolute";
  btnBrain.domElement.style.bottom = "14px";
  btnBrain.domElement.style.transform = "translateX(-50%)";
  btnBrain.domElement.style.zIndex = "10";
  btnBrain.domElement.addEventListener("click", () => {
    agentSystem.policyActive = !agentSystem.policyActive;
    if (agentSystem.policyActive) btnBrain.setActiveStyle();
    else btnBrain.setInactiveStyle();
  });
  agentViewport.domElement.appendChild(btnBrain.domElement);

  agentViewport.onResize = ({ width, height }) => {
    const contentWidth = Math.min(width, maxContentWidth);
    // keep the overlaid controls inside the same column the header uses,
    // instead of letting them drift to the edges of a wide screen
    const columnInset = Math.max(14, Math.round((width - maxContentWidth) / 2));
    const inset = agentViewport.fullscreen ? 14 : columnInset;

    const panelWidth = codeSnippet.collapsed
      ? 74
      : Math.min(480, Math.max(240, Math.round(contentWidth * 0.46)));

    snippetElement.style.position = "absolute";
    snippetElement.style.top = "14px";
    snippetElement.style.right = `${inset}px`;
    snippetElement.style.bottom = codeSnippet.collapsed
      ? ""
      : `${14 + btnFullscreen.domElement.offsetHeight + 14}px`;
    snippetElement.style.width = `${panelWidth}px`;

    agentPicker.domElement.style.left = `${inset}px`;

    btnFullscreen.domElement.style.right = `${inset}px`;
    btnFullscreen.domElement.style.bottom = "14px";

    const occupiedWidth = codeSnippet.collapsed ? 0 : panelWidth + 14;
    const simWidth = width - occupiedWidth;
    agentViewport.overlayFractionRight = occupiedWidth / width;
    btnBrain.domElement.style.left = `${simWidth / 2}px`;

    const brainScale = agentViewport.fullscreen ? 1 : 0.85;
    const brainSize = Math.round(brainScale * Math.max(22, Math.min(34, height * 0.072)));
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
    agentSystem.step();
    agentViewport.render();
  }, 1000 / 30);

  window.system = system;
}

main();