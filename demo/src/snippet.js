import { buildUrl, dataUrl } from "./refs.js";

export default function snippetForAgent(agentName) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body>
  <script type="module">
    import * as algovivo from "${buildUrl}/algovivo.min.js";

    async function loadWasm() {
      const response = await fetch("${buildUrl}/algovivo.wasm");
      const wasm = await WebAssembly.instantiateStreaming(response);
      return wasm.instance;
    }

    async function main() {
      const meshData = await (await fetch("${dataUrl}/${agentName}/mesh.json")).json();

      const policyData = await (await fetch("${dataUrl}/${agentName}/policy.json")).json();

      const system = new algovivo.System({
        wasmInstance: await loadWasm()
      });
      system.set(meshData);

      const policy = new algovivo.nn.MLPPolicy({ system, active: true });
      policy.loadData(policyData);

      const viewport = new algovivo.SystemViewport({
        system,
        sortedVertexIds: meshData.sorted_vertex_ids,
        vertexDepths: meshData.depth
      });
      document.body.appendChild(viewport.domElement);
      viewport.render();

      setInterval(() => {
        policy.step();
        system.step();
        viewport.render();
      }, 1000 / 30);
    }

    main();
  <\/script>
</body>
</html>`;
}
