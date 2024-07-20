import algovivo from "../../build/algovivo.min.mjs";
import NeuralPolicy from "./NeuralPolicy.js";
import BrainButton from "./BrainButton.js";
import { initStyle, makeGitHubLink } from "./ui.js";
import SystemViewport from "./SystemViewport.js";
import Sections from "./Sections.js";
import Header from "./Header.js";

async function loadWasm() {
  const response = await fetch("algovivo.wasm");
  const wasm = await WebAssembly.instantiateStreaming(response);
  return wasm.instance;
}

const dataRoot = "data";

async function loadMeshData() {
  const response = await fetch(`${dataRoot}/mesh.json`);
  return await response.json();
}

async function loadPolicyData() {
  const response = await fetch(`${dataRoot}/policy.json`);
  return await response.json();
}

async function main() {
  initStyle();
  makeGitHubLink();
  const header = new Header();
  document.body.appendChild(header.domElement);

  const divContent = document.createElement("div");
  divContent.style.display = "flex";
  divContent.style.flexDirection = "column";
  divContent.style.alignItems = "center";
  divContent.style.width = "100%";
  document.body.appendChild(divContent);

  const wasmInstance = await loadWasm();
  const system = new algovivo.System({
    wasmInstance: wasmInstance
  });

  document.documentElement.style.height = "100%";
  document.body.style.height = "100%";
  document.body.style.display = "flex";
  document.body.style.margin = 0;
  document.body.style.padding = 0;
  document.body.style.alignItems = "center";

  const [meshData, policyData] = await Promise.all(
    [loadMeshData, loadPolicyData].map(f => f())
  );

  system.set({
    pos: meshData.pos,
    muscles: meshData.muscles,
    musclesL0: meshData.l0,
    triangles: meshData.triangles,
    trianglesRsi: meshData.rsi
  });

  const viewport = new SystemViewport({
    system: system,
    sortedVertexIds: meshData.sorted_vertex_ids,
    vertexDepths: meshData.depth
  });
  divContent.appendChild(viewport.domElement);

  const policy = new NeuralPolicy({
    system: system,
    stochastic: true
  });
  policy.loadData(policyData);

  window.togglePolicy = () => {
    policy.active = !policy.active;
    if (policy.active) btnBrain.setActiveStyle();
    else btnBrain.setInactiveStyle();
  }

  const btnBrain = new BrainButton();
  btnBrain.domElement.style.marginTop = "8px";
  btnBrain.domElement.style.marginBottom = "16px";
  btnBrain.domElement.addEventListener("click", () => {
    togglePolicy();
  });
  divContent.appendChild(btnBrain.domElement);

  const sections = new Sections();
  divContent.appendChild(sections.domElement);

  viewport.render();
  setInterval(() => {
    policy.step();
    system.step();
    viewport.render();
  }, 1000 / 30);

  window.system = system;
}

main();