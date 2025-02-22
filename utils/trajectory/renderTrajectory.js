const { ArgumentParser } = require("argparse");
const { Window, runWebServer } = require("./ppw");
const TrajectoryData = require("./TrajectoryData");
const FrameRecorder = require("./FrameRecorder");
const fs = require("fs");
const path = require("path");

async function renderTrajectory(args = {}) {
  const stepsDirname = args.stepsDirname;
  const meshFilename = args.meshFilename;
  const framesDirname = args.framesDirname;

  const onServerReady = async (port) => {
    const width = parseInt(process.env.WIDTH, 10) || 300;
    const height = parseInt(process.env.HEIGHT, 10) || 300;

    const recorder = new FrameRecorder({ framesDirname });

    const window = new Window({
      indexUrl: `http://localhost:${port}`,
      width: width,
      height: height,
      headless: true
    });
    await window.launch();

    const meshData = JSON.parse(await fs.promises.readFile(meshFilename, "utf8"));

    const trajectoryData = new TrajectoryData(stepsDirname);
    const step0 = await trajectoryData.loadStep(0);
    
    await window.evaluate(
      async (args) => {
        async function loadWasm() {
          const response = await fetch("algovivo.wasm");
          const wasm = await WebAssembly.instantiateStreaming(response);
          return wasm.instance;
        }
    
        async function main() {
          document.body.style.boxSizing = "border-box";
          document.body.style.margin = "0";
          document.body.style.padding = "0";

          const meshData = args.meshData;

          const system = new algovivo.System({
            wasmInstance: await loadWasm()
          });
          system.set({
            pos: args.pos,
            triangles: meshData.triangles,
            muscles: meshData.muscles
          });
    
          const viewport = new algovivo.SystemViewport({
            system,
            sortedVertexIds: meshData.sorted_vertex_ids,
            vertexDepths: meshData.depth
          });
          viewport.setSize({ width: args.width, height: args.height });
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
        meshData: meshData
      }
    );
    
    const n = await trajectoryData.numSteps();
    console.log(`found ${n} steps`);
    for (let i = 0; i < n; i++) {
      console.log(`${i + 1} / ${n}`);
      const stepData = await trajectoryData.loadStep(i);
      await window.evaluate(async (data) => {
        system.pos.set(data.pos);
        if (system.a != null) system.a.set(data.a);
        viewport.render();
      }, { pos: stepData.pos0, a: stepData.a0 });
      await recorder.saveFrame(window);
    }

    await window.close();
  }

  await runWebServer({
    staticDirname: path.join(__dirname, "public"),
    onReady: onServerReady
  });
}

async function main() {
  const argParser = new ArgumentParser();
  argParser.addArgument("--mesh-filename", { required: true });
  argParser.addArgument("--steps-dirname", { required: true });
  args = argParser.parseArgs();

  const meshFilename = args.mesh_filename;
  const stepsDirname = args.steps_dirname;

  const outputDirname = "frames.out";

  await renderTrajectory({
    meshFilename: meshFilename,
    stepsDirname: stepsDirname,
    framesDirname: outputDirname
  });
}

main();