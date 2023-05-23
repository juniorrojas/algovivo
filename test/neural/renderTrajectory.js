const algovivo = require("algovivo");
const { cleandir } = require("../utils");
const fs = require("fs");
const { Window, runWebServer } = require("./utils");

async function render(args = {}) {
  const rootDirname = args.dataDirname;
  const framesDirname = args.framesDirname;

  await cleandir(framesDirname);

  const main = async (port) => {
    const window = new Window({
      indexUrl: `http://localhost:${port}`,
      width: 400,
      height: 400,
      headless: true
    });
    await window.launch();

    const initData = JSON.parse(fs.readFileSync(`${rootDirname}/mesh.json`));
    const d = JSON.parse(fs.readFileSync(`${rootDirname}/trajectory/0.json`));

    await window.evaluate(async (data) => {
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
          x: data.x,
          triangles: data.triangles,
          springs: data.springs
        });
  
        const viewport = new algovivo.SystemViewport({ system });
        viewport.domElement.style.border = "2px solid black";
        viewport.domElement.style.boxSizing = "border-box";
        document.body.appendChild(viewport.domElement);

        window.system = system;
        window.viewport = viewport;
      }

      await main();
    }, { x: d.x0, triangles: initData.triangles, springs: initData.springs });
    
    const n = 100;
    for (let i = 0; i < n; i++) {
      console.log(i);
      const di = JSON.parse(fs.readFileSync(`${rootDirname}/trajectory/${i}.json`));
      await window.evaluate(async (data) => {
        system.x0.set(data.x);
        system.a.set(data.a);
        viewport.render();
      }, { x: di.x0, a: di.a0 });
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