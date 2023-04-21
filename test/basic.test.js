const algovivo = require("algovivo/index");
const utils = require("./utils");

test("test", async () => {
  const system = await algovivo.makeSystem({
    wasmInstance: await utils.loadWasm()
  });
  expect(system.numVertices()).toBe(0);
  expect(system.numSprings()).toBe(0);
  expect(system.numTriangles()).toBe(0);

  system.setX([
    [0, 0]
  ]);

  expect(system.numVertices()).toBe(1);
});