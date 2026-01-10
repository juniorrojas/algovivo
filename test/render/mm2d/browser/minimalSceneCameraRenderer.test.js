const ppw = require("./ppw");
const path = require("path");
const fs = require("fs");

// minimal scene, camera and renderer example
test("minimal scene, camera and renderer", async () => {
  const main = async (port) => {
    const window = new ppw.Window({
      headless: true,
      indexUrl: `http://localhost:${port}/minimalSceneCameraRenderer.html`,
      width: 200,
      height: 200
    });

    try {
      await window.launch();

      await window.evaluate(async () => {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("timeout waiting for mm2d"));
          }, 5000);

          const interval = setInterval(() => {
            if (window.mm2dReady) {
              clearInterval(interval);
              clearTimeout(timeout);
              resolve();
            }
          }, 50);
        });
      });

      const screenshotPath = path.join(__dirname, "minimalSceneCameraRenderer.out.png");
      await window.screenshot({ path: screenshotPath });

      expect(fs.existsSync(screenshotPath)).toBe(true);
    } finally {
      await window.close();
    }
  };

  await ppw.runWebServer({
    staticDirname: path.join(__dirname, "public"),
    onReady: main
  });
}, 10000);
