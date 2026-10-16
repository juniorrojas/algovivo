import net from "net";
import http from "http";
import path from "path";
import fs from "fs/promises";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".cjs": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".wasm": "application/wasm",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

function makeStaticHandler(staticDirname) {
  const root = path.resolve(staticDirname);
  return async (req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    let filename = path.join(root, pathname);
    if (filename != root && !filename.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    try {
      if ((await fs.stat(filename)).isDirectory()) {
        filename = path.join(filename, "index.html");
      }
      const data = await fs.readFile(filename);
      const contentType = contentTypes[path.extname(filename)] ?? "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType }).end(data);
    } catch (e) {
      res.writeHead(404).end();
    }
  };
}

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
    const server = http.createServer(makeStaticHandler(staticDirname));
    server.listen(port, async () => {
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

export {
  getFreePort,
  runWebServer
};
