import algovivo from "../../build/algovivo.module.min.js";
import NeuralPolicy from "./NeuralPolicy.js";
import IconButton from "./IconButton.js";
import { makeGitHubCorner, makeHeader } from "./ui.js";

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

  const viewport = new algovivo.SystemViewport({
    system: system
  });
  viewport.domElement.style.borderRadius = "10px";
  viewport.domElement.style.border = "2px solid #c9c9c9";
  viewport.domElement.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.1)";
  divContent.appendChild(viewport.domElement);
  
  const mq = window.matchMedia("(max-width: 420px)");
  const updateMq = () => {
    if (mq.matches) {
      viewport.setSize({ width: 250, height: 250});
    } else {
      viewport.setSize({ width: 400, height: 400});
    }
  }
  mq.addEventListener("change", (event) => {
    updateMq();
  });
  updateMq();
  
  const dataRoot = "data";
  const meshDataPromise = fetch(`${dataRoot}/mesh.json`);
  const policyDataPromise = fetch(`${dataRoot}/policy.json`);
  const [meshDataResponse, policyDataResponse] = await Promise.all([
    meshDataPromise, policyDataPromise
  ]);

  const meshData = await meshDataResponse.json();
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
  const policyData = await policyDataResponse.json();
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