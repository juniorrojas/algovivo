import utils from "./utils/index.js";

test("main", async () => {
  const main = async (port) => {
    const window = new utils.Window({
      headless: true,
      indexUrl: `http://localhost:${port}`,
      width: 700,
      height: 700
    });
    try {
      await window.launch();
      const numVertices = await window.evaluate(async () => {
        function waitInit() {
          return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
              if (window.system != null) {
                clearInterval(interval);
                resolve();
              }
            }, 1);
          });
        }
        await waitInit();
        return system.numVertices();
      });
      expect(numVertices).toBe(28);
      
      await window.page.waitForNetworkIdle();

      await window.screenshot({ path: `${__dirname}/screenshot.out.png` });
    } finally {
      await window.close();
    }
  }

  await utils.runWebServer({
    staticDirname: `${__dirname}/../public`,
    onReady: main
  });
}, 10000);