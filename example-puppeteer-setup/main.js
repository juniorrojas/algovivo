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
    await window.evaluate(async () => {
      // function waitInit() {
      //   return new Promise((resolve, reject) => {
      //     const interval = setInterval(() => {
      //       if (window.system != null) {
      //         clearInterval(interval);
      //         resolve();
      //       }
      //     }, 1);
      //   });
      // }
      // await waitInit();
    });
    
    await window.page.waitForNetworkIdle();

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