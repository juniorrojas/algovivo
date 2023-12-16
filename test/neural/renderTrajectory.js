const algovivo = require("algovivo");
const { cleandir, getNumFilesWithExtension } = require("../utils");
const fs = require("fs");
const { Window, runWebServer } = require("./utils");

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

    const initData = JSON.parse(fs.readFileSync(`${rootDirname}/mesh.json`));
    const trajectoryDataDirname = `${rootDirname}/trajectory`;
    const initStateData = JSON.parse(fs.readFileSync(`${trajectoryDataDirname}/0.json`));

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
        pos: initStateData.x0,
        triangles: initData.triangles,
        muscles: initData.muscles
      }
    );
    
    const n = await getNumFilesWithExtension(trajectoryDataDirname, ".json");
    for (let i = 0; i < n; i++) {
      console.log(`${i + 1} / ${n}`);
      const stepData = JSON.parse(fs.readFileSync(`${trajectoryDataDirname}/${i}.json`));
      await window.evaluate(async (data) => {
        system.pos0.set(data.x);
        system.a.set(data.a);
        viewport.render();
      }, { x: stepData.x0, a: stepData.a0 });
      await window.screenshot({ path: `${framesDirname}/${i}.png` });
    }

    await window.close();
  }

  await runWebServer({
    staticDirname: `${__dirname}/public`,
    onReady: main
  });
}

render({
  dataDirname: `${__dirname}/data`,
  framesDirname: `${__dirname}/frames.out`
});