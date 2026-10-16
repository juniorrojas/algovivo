import { test } from "node:test";
import assert from "node:assert";
import ppw from "./ppw/index.js";

test("main", { timeout: 60000 }, async () => {
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
      assert.strictEqual(numVertices, 28);
      
      await window.waitForNetworkIdle();

      await window.screenshot({ path: `${import.meta.dirname}/screenshot.out.png` });
    } finally {
      await window.close();
    }
  }

  await ppw.runWebServer({
    staticDirname: `${import.meta.dirname}/../public`,
    onReady: main
  });
});