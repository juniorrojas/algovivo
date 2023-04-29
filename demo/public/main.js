const Viewport = algovivo.SystemViewport;

class NeuralPolicy {
  constructor(args = {}) {
    if (args.system == null) {
      throw new Error("system required to create policy");
    }
    this.system = args.system;
    this.ten = this.system.ten;

    this.stochastic = args.stochastic ?? false;

    const system = this.system;
    const ten = this.ten;

    const numVertices = system.numVertices();
    const numSprings = system.numSprings();
    const spaceDim = 2;

    this.projectedX = ten.zeros([numVertices, spaceDim]);
    this.projectedV = ten.zeros([numVertices, spaceDim]);
    const inputSize = numVertices * spaceDim * 2;
    const outputSize = numSprings;
    this.input = ten.zeros([inputSize]);

    this.active = false;

    const nn = ten.nn;
    this.model = nn.Sequential(
      nn.Linear(inputSize, 32),
      nn.ReLU(),
      nn.Linear(32, outputSize),
      nn.Tanh()
    );
  }

  step(args = {}) {
    const system = this.system;
    const wasmInstance = this.ten.wasmInstance;
    const trace = args.trace;

    const numVertices = system.numVertices();

    let output;
    if (this.active) {
      wasmInstance.exports.framenorm_projection(
        numVertices,
        system.x0.ptr,
        this.centerVertexId,
        this.forwardVertexId,
        system.x0.ptr,
        this.projectedX.slot.ptr,
        true
      );

      wasmInstance.exports.framenorm_projection(
        numVertices,
        system.x0.ptr,
        this.centerVertexId,
        this.forwardVertexId,
        system.v0.ptr,
        this.projectedV.slot.ptr,
        false
      );

      wasmInstance.exports.make_policy_input(
        numVertices,
        this.projectedX.slot.ptr,
        this.projectedV.slot.ptr,
        this.input.slot.ptr
      );

      if (trace != null) trace.input = this.input.toArray();

      output = this.model.forward(this.input);
      if (trace != null) trace.output = output.toArray();
    }

    const minA = this.minA;
    const maxAbsDa = this.maxAbsDa;

    const a = this.system.a.slot.f32();
    const numSprings = this.system.numSprings();
    for (let i = 0; i < numSprings; i++) {
      let da;
      if (this.active) {
        da = output.get([i]);
        if (this.stochastic) {
          da += (Math.random() - 0.5) * 0.5;
        }
      } else {
        da = 1;
      }

      if (da > maxAbsDa) da = maxAbsDa;
      if (da < -maxAbsDa) da = -maxAbsDa;
      let ai1 = a[i] + da;
      if (ai1 < minA) ai1 = minA;
      if (ai1 > 1) ai1 = 1;
      a[i] = ai1;
    }
  }

  async loadData(data) {
    const fc1 = this.model.layers[0];
    fc1.weight.set(data.fc1.weight);
    fc1.bias.set(data.fc1.bias);
    const fc2 = this.model.layers[2];
    fc2.weight.set(data.fc2.weight);
    fc2.bias.set(data.fc2.bias);

    this.minA = data.min_a ?? (() => { throw new Error("min_a required") })();
    this.maxAbsDa = data.max_abs_da ?? (() => { throw new Error("max_abs_da required") })();
    this.centerVertexId = data.center_vertex_id ?? (() => { throw new Error("center_vertex_id required") })();
    this.forwardVertexId = data.forward_vertex_id ?? (() => { throw new Error("forward_vertex_id required") })();
  }
}

async function loadWasm() {
  const wasm = await WebAssembly.instantiateStreaming(
    await fetch("algovivo.wasm")
  );
  return wasm.instance;
}

class IconButton {
  constructor(args = {}) {
    const div = this.domElement = document.createElement("div");
    div.style.userSelect = "none";
    div.style.padding = "12px";
    div.style.cursor = "pointer";
    div.style.borderRadius = "50%";
    div.style.width = "78px";
    div.style.height = "78px";
    div.style.minHeight = div.style.height;
    div.style.margin = "4px";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.boxShadow = "0 0 8px rgba(0, 0, 0, 0.2)";

    const icon = new Image();
    icon.src = args.src;
    const iconSize = 40
    icon.style.width = `${iconSize}px`;
    icon.style.height = `${iconSize}px`;
    div.appendChild(icon);

    this.setInactiveStyle();
  }

  setActiveStyle() {
    this.domElement.style.backgroundColor = "black";
  }

  setInactiveStyle() {
    this.domElement.style.backgroundColor = "rgba(1, 1, 1, 0.2)";
  }
}

const headerBackgroundColor = "#000000";

function makeGitHubCorner() {
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.href = "https://github.com/juniorrojas/algovivo";
  a.classList.add("github-corner");
  a.ariaLabel = "View source on GitHub";
  const color1 = "#ffffff";
  const color2 = headerBackgroundColor;
  a.innerHTML = `<svg class=\"view-on-github\" width=\"80\" height=\"80\" viewBox=\"0 0 250 250\" style=\"fill:${color1}; color:${color2}; position: absolute; top: 0; border: 0; right: 0;\" aria-hidden=\"true\"><path d=\"M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z\"></path><path d=\"M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2\" fill=\"currentColor\" style=\"transform-origin: 130px 106px;\" class=\"octo-arm\"></path><path d=\"M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z\" fill=\"currentColor\" class=\"octo-body\"></path></svg></a><style>.view-on-github{cursor: pointer}.github-corner:hover .octo-arm{animation:octocat-wave 560ms ease-in-out}@keyframes octocat-wave{0%,100%{transform:rotate(0)}20%,60%{transform:rotate(-25deg)}40%,80%{transform:rotate(10deg)}}@media (max-width:500px){.github-corner:hover .octo-arm{animation:none}.github-corner .octo-arm{animation:octocat-wave 560ms ease-in-out}}</style>`;
}

function makeHeader() {
  const divTitle = document.createElement("div");
  document.body.appendChild(divTitle);
  (style => {
    style.display = "flex";
    style.flexDirection = "column";
    style.alignItems = "center";
    style.color = "white";
    style.width = "100%";
    style.backgroundColor = headerBackgroundColor;
    style.paddingTop = "20px";
    style.paddingBottom = "20px";
    style.paddingRight = "5px";
    style.paddingLeft = "5px";
    style.marginBottom = "30px";
    style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
  })(divTitle.style);

  const h1 = document.createElement("h1");
  h1.textContent = "algovivo";
  divTitle.appendChild(h1);
  ((style) => {
    style.fontSize = "33px";
  })(h1.style);

  const h2 = document.createElement("h2");
  h2.textContent = "an energy-based formulation for soft-bodied virtual creatures";
  divTitle.appendChild(h2);
  ((style) => {
    style.textAlign = "center";
    style.fontSize = "18px";
    style.color = "#c7c7c7";
  })(h2.style);
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

  const viewport = new Viewport({
    system: system
  });
  viewport.domElement.style.borderRadius = "10px";
  viewport.domElement.style.border = "2px solid #c9c9c9";
  viewport.domElement.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.1)";
  divContent.appendChild(viewport.domElement);
  
  const dataRoot = "data";

  const r = await fetch(`${dataRoot}/mesh.json`);
  const meshData = await r.json();
  system.set({
    x: meshData.x,
    triangles: meshData.triangles,
    springs: meshData.springs,
    springsL0: meshData.l0
  });

  const policy = new NeuralPolicy({
    system: system,
    stochastic: true
  });
  const r1 = await fetch(`${dataRoot}/policy.json`);
  const policyData = await r1.json();
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