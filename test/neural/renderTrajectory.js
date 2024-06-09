const algovivo = require("algovivo");
const { cleandir } = require("../utils");
const fs = require("fs");
const path = require("path");
const { Window, runWebServer } = require("./utils");
const TrajectoryData = require("./TrajectoryData");

async function render(args = {}) {
  const rootDirname = args.dataDirname;
  const framesDirname = args.framesDirname;

  await cleandir(framesDirname);

  const main = async (port) => {
    const width = 300;
    const height = 300;

    const window = new Window({
      indexUrl: `http://localhost:${port}`,
      width: width,
      height: height,
      headless: true
    });
    await window.launch();

    const meshFilename = path.join(rootDirname, "mesh.json");
    const meshData = JSON.parse(await fs.promises.readFile(meshFilename, "utf8"));
    const trajectoryDataDirname = path.join(rootDirname, "trajectory");

    const trajectoryData = new TrajectoryData(trajectoryDataDirname);
    const step0 = await trajectoryData.loadStep(0);

    await window.evaluate(
      async (data) => {
        async function loadWasm() {
          const response = await fetch("algovivo.wasm");
          const wasm = await WebAssembly.instantiateStreaming(response);
          return wasm.instance;
        }
    
        async function main() {
          document.body.style.boxSizing = "border-box";
          document.body.style.margin = "0";
          document.body.style.padding = "0";

          const system = new algovivo.System({
            wasmInstance: await loadWasm()
          });
          system.set({
            pos: data.pos,
            triangles: data.triangles,
            muscles: data.muscles
          });
    
          const viewport = new algovivo.SystemViewport({ system });
          viewport.setSize({ width: data.width, height: data.height });
          viewport.domElement.style.border = "0px";
          viewport.domElement.style.boxSizing = "border-box";
          document.body.appendChild(viewport.domElement);

          window.system = system;
          window.viewport = viewport;
        }

        await main();
      },
      {
        width, height,
        pos: step0.pos0,
        triangles: meshData.triangles,
        muscles: meshData.muscles
      }
    );
    
    const n = await trajectoryData.numSteps();
    for (let i = 0; i < n; i++) {
      console.log(`${i + 1} / ${n}`);
      const stepData = await trajectoryData.loadStep(i);
      await window.evaluate(async (data) => {
        system.pos.set(data.pos);
        system.a.set(data.a);
        viewport.render();
      }, { pos: stepData.pos0, a: stepData.a0 });
      const frameFilename = path.join(framesDirname, `${i}.png`);
      await window.screenshot({ path: frameFilename });
    }

    await window.close();
  }

  await runWebServer({
    staticDirname: path.join(__dirname, "public"),
    onReady: main
  });
}

render({
  dataDirname: path.join(__dirname, "data"),
  framesDirname: path.join(__dirname, "frames.out")
});