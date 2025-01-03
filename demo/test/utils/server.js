import net from "net";
import express from "express";

export function getFreePort() {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(0, () => {
      const port = server.address().port;
      server.close();
      resolve(port);
    });
  });
}

export function runWebServer(args = {}) {
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
      let port;
      if (args.port == null) {
        port = await getFreePort();
      } else {
        port = args.port;
      }
      
      const app = express();
      
      if (args.onPreListen != null) {
        args.onPreListen(app);
      }

      app.use(express.static(staticDirname));
      
      const server = app.listen(
        port,
        async () => {
          try {
            await onReady(port);
          } catch(e) {
            reject(e);
          } finally {
            const daemon = args.daemon ?? false;
            if (!daemon) {
              server.close(() => {
                resolve();
              });
            } else {
              resolve();
            }
          }
        });
    })();
  });
}
