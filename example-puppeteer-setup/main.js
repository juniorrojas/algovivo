const utils = require("./utils");

const onReady = async (port) => {
  const window = new utils.Window({
    headless: true,
    indexUrl: `http://localhost:${port}`,
    width: 700,
    height: 700
  });
  try {
    await window.launch();    
    await window.page.waitForNetworkIdle();

    await window.evaluate(() => {
      const mm2d = algovivo.mm2d;

      const renderer = new mm2d.core.Renderer();
      renderer.setSize({ width: 200, height: 200 });
      renderer.domElement.style.border = "1px solid black";
      document.body.appendChild(renderer.domElement);

      const scene = new mm2d.core.Scene();
      const camera = new mm2d.core.Camera();

      const mesh = scene.addMesh();
      mesh.x = [
        [0, 0],
        [1, 0],
        [1, 1]
      ];
      mesh.triangles = [
        [0, 1, 2]
      ];

      camera.center({
        worldCenter: mesh.computeCenter(),
        worldWidth: 2,
        viewportWidth: renderer.width,
        viewportHeight: renderer.height,
      });

      renderer.render(scene, camera);
    });

    await window.screenshot({ path: `${__dirname}/screenshot.out.png` });
  } finally {
    await window.close();
  }
}

async function main() {
  await utils.runWebServer({
    staticDirname: `${__dirname}/public`,
    onReady: onReady
  });
}

main();