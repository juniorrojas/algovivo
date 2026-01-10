const ppw = require("./ppw");
const path = require("path");
const fs = require("fs");

// a point shader is like a vertex shader in GPU programming, but using the canvas 2d context,
// it's a function that gets executed per mesh vertex
test("point shader", async () => {
  const main = async (port) => {
    const window = new ppw.Window({
      headless: true,
      indexUrl: `http://localhost:${port}/pointShader.html`,
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

      const screenshotPath = path.join(__dirname, "pointShader.out.png");
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
