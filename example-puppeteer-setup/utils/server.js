const net = require("net");
const express = require("express");

function getFreePort() {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(0, () => {
      const port = server.address().port;
      server.close();
      resolve(port);
    });
  });
}

function runWebServer(args = {}) {
  const staticDirname = args.staticDirname;
  if (staticDirname == null) {
    throw new Error("staticDirname required");
  }
  const onReady = args.onReady;
  if (onReady == null) {
    throw new Error("onReady required");
  }
  return new Promise((resolve, reject) => {
    (async () => {
    const port = await getFreePort();
    const app = express();
    app.use(express.static(staticDirname));
    const server = app.listen(port, async () => {
      try {
        await onReady(port);
      } catch(e) {
        reject(e);
      } finally {
        server.close(() => {
          resolve();
        });
      }
    });
    })();
  });
}

module.exports = {
  getFreePort: getFreePort,
  runWebServer: runWebServer
}