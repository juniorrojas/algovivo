const algovivo = require("algovivo");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const { Window, runWebServer } = require("./utils");
const TrajectoryData = require("./TrajectoryData");

function fileExists(filename) {
  return new Promise((resolve, reject) => {
    fs.access(filename, fs.constants.F_OK, (err) => {
      if (err) resolve(false);
      else resolve(true);
    });
  });
}

async function cleandir(dirname) {
  if (!await fileExists(dirname)) {
    await fsp.mkdir(dirname);
  } else {
    fs.rmSync(dirname, { recursive: true });
    await fsp.mkdir(dirname);
  }
}

async function render(args = {}) {
  const trajectoryDataDirname = args.trajectoryDataDirname;
  const meshFilename = args.meshFilename;
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

    const meshData = JSON.parse(await fs.promises.readFile(meshFilename, "utf8"));

    const trajectoryData = new TrajectoryData(trajectoryDataDirname);
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

async function main() {
  const meshFilename = process.env.MESH_FILENAME;
  if (!meshFilename) {
    console.error("MESH_FILENAME environment variable not set");
    process.exit(1);
  }
  
  const trajectoryDataDirname = process.env.TRAJECTORY_DATA_DIRNAME;
  if (!trajectoryDataDirname) {
    console.error("TRAJECTORY_DATA_DIRNAME environment variable not set");
    process.exit(1);
  }

  const outputDirname = "frames.out";

  await render({
    meshFilename: meshFilename,
    trajectoryDataDirname: trajectoryDataDirname,
    framesDirname: outputDirname
  });
}

main();