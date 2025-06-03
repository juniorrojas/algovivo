const { ArgumentParser } = require("argparse");
const { Window, runWebServer } = require("./ppw");
const TrajectoryData = require("./TrajectoryData");
const FrameRecorder = require("./FrameRecorder");
const fs = require("fs");
const path = require("path");

async function renderState(recorder, window, pos, a) {
  await window.evaluate(async (data) => {
    system.pos.set(data.pos);
    if (system.a != null) system.a.set(data.a);
    viewport.render();
  }, { pos: pos, a: a });
  await recorder.saveFrame(window);
}

async function renderTrajectory(args = {}) {
  const stepsDirname = args.stepsDirname;
  const meshFilename = args.meshFilename;
  const framesDirname = args.framesDirname;
  
  const width = args.width ?? 300;
  const height = args.height ?? 300;

  const onServerReady = async (port) => {
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
      const pos = stepData.pos0;
      const a = stepData.a0;
      await renderState(recorder, window, pos, a);

      if (i == n - 1) {
        const pos = stepData.pos1;
        const a = stepData.a1;
        if (pos != null ) {
          console.log("rendering final state...");
          await renderState(recorder, window, pos, a);
        }
      }
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
  argParser.addArgument("--width", { defaultValue: 300, type: "int" });
  argParser.addArgument("--height", { defaultValue: 300, type: "int" });
  argParser.addArgument(["-o", "--output-dirname"], { defaultValue: "frames.out" });
  args = argParser.parseArgs();

  const meshFilename = args.mesh_filename;
  const stepsDirname = args.steps_dirname;
  const outputDirname = args.output_dirname;

  await renderTrajectory({
    meshFilename: meshFilename,
    stepsDirname: stepsDirname,
    framesDirname: outputDirname,
    width: args.width,
    height: args.height
  });

  console.log(`Frames saved to ${outputDirname}`);
}

main();