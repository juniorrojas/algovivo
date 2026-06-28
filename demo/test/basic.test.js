import ppw from "./ppw/index.js";

test("main", async () => {
  const main = async (port) => {
    const window = new ppw.Window({
      headless: true,
      indexUrl: `http://localhost:${port}`,
      width: 800,
      height: 1200
    });
    try {
      await window.launch();
      await window.waitForReady(() => window.system != null);
      const numVertices = await window.evaluate(() => system.numVertices);
      expect(numVertices).toBe(28);
      
      await window.waitForNetworkIdle();

      await window.screenshot({ path: `${__dirname}/screenshot.out.png` });
    } finally {
      await window.close();
    }
  }

  await ppw.runWebServer({
    staticDirname: `${__dirname}/../public`,
    onReady: main
  });
}, 60000);