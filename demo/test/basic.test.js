const utils = require("./utils");

test("main", async () => {
  const main = async (port) => {
    const window = new utils.Window({
      headless: true,
      indexUrl: `http://localhost:${port}`
    });
    try {
      await window.launch();
      const x = await window.evaluate(async () => {
        return 123;
      });
      expect(x).toEqual(123);
    } finally {
      await window.close();
    }
  }

  await utils.runWebServer({
    staticDirname: `${__dirname}/../public`,
    onReady: main
  });
})