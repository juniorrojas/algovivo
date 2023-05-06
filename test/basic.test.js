const algovivo = require("algovivo");
const utils = require("./utils");

test("test", async () => {
  const system = new algovivo.System({
    wasmInstance: await utils.loadWasm()
  });
  expect(system.numVertices()).toBe(0);
  expect(system.numSprings()).toBe(0);
  expect(system.numTriangles()).toBe(0);

  system.set({
    x: [
      [0, 0]
    ]
  });

  expect(system.numVertices()).toBe(1);
});