const utils = require("./utils");

test("main", async () => {
  const main = async (port) => {
    const window = new utils.Window({
      headless: true,
      indexUrl: `http://localhost:${port}`,
      width: 800,
      height: 800
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
    } finally {
      await window.close();
    }
  }

  await utils.runWebServer({
    staticDirname: `${__dirname}/../public`,
    onReady: main
  });
});