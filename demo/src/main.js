import algovivo from "../../build/algovivo.min.mjs";
import NeuralPolicy from "./NeuralPolicy.js";
import BrainButton from "./BrainButton.js";
import { initStyle, makeGitHubLink, makeHeader } from "./ui.js";
import SystemViewport from "./SystemViewport.js";

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
  makeHeader();

  const divContent = document.createElement("div");
  divContent.style.display = "flex";
  divContent.style.flexDirection = "column";
  divContent.style.alignItems = "center";
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

  const viewport = new SystemViewport({
    system: system,
    sortedVertexIds: meshData.sorted_vertex_ids
  });
  divContent.appendChild(viewport.domElement);

  system.set({
    pos: meshData.pos,
    muscles: meshData.muscles,
    musclesL0: meshData.l0,
    triangles: meshData.triangles,
    trianglesRsi: meshData.rsi
  });

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

  viewport.render();
  setInterval(() => {
    policy.step();
    system.step();
    viewport.render();
  }, 1000 / 30);

  window.system = system;
}

main();