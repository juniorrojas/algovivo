import algovivo from "../../build/algovivo.module.min.js";
import NeuralPolicy from "./NeuralPolicy.js";
import IconButton from "./IconButton.js";
import { makeGitHubCorner, makeHeader } from "./ui.js";
import SystemViewport from "./SystemViewport.js";

async function loadWasm() {
  const response = await fetch("algovivo.wasm");
  const wasm = await WebAssembly.instantiateStreaming(response);
  return wasm.instance;
}

async function main() {
  makeGitHubCorner();
  makeHeader();

  document.body.style.background = "rgb(248, 248, 248)";
  document.body.style.display = "flex";
  document.body.style.flexDirection = "column";

  const divContent = document.createElement("div");
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

  const viewport = new SystemViewport({ system });
  divContent.appendChild(viewport.domElement);
  
  const dataRoot = "data";

  async function loadMeshData() {
    const response = await fetch(`${dataRoot}/mesh.json`);
    return await response.json();
  }

  async function loadPolicyData() {
    const response = await fetch(`${dataRoot}/policy.json`);
    return await response.json();
  }

  const [meshData, policyData] = await Promise.all(
    [loadMeshData, loadPolicyData].map(f => f())
  );

  system.set({
    x: meshData.x,
    springs: meshData.springs,
    springsL0: meshData.l0,
    triangles: meshData.triangles,
    trianglesRsi: meshData.rsi
  });

  const policy = new NeuralPolicy({
    system: system,
    stochastic: true
  });
  policy.loadData(policyData);

  const btnBrain = new IconButton({
    src: "assets/brain.svg"
  });
  btnBrain.domElement.addEventListener("click", () => {
    policy.active = !policy.active;
    if (policy.active) btnBrain.setActiveStyle();
    else btnBrain.setInactiveStyle();
  });
  document.body.appendChild(btnBrain.domElement);

  viewport.render();
  setInterval(() => {
    policy.step();
    system.step();
    viewport.render();
  }, 1000 / 30);

  window.system = system;
}

main();