const algovivo = require("algovivo");
const utils = require("./utils");

expect.extend({ toBeCloseToArray: utils.toBeCloseToArray });

test("hit test", async () => {
  const wasmInstance = await utils.loadWasm();
  const system = new algovivo.System({ wasmInstance });
  
  system.set({
    pos: [
      [0, 0],
      [1, 2]
    ]
  });

  const viewport = new algovivo.SystemViewport({ system, headless: true });
  expect(viewport.hitTestVertex([0, 0])).toBe(0);
  expect(viewport.hitTestVertex([1, 2])).toBe(1);
  expect(viewport.hitTestVertex([10, 20])).toBeNull();
  expect(viewport.hitTestVertex([1, 2], 100)).toBe(1);
});

test("fix vertex", async () => {
  const wasmInstance = await utils.loadWasm();
  const system = new algovivo.System({ wasmInstance });
  
  system.set({
    pos: [
      [5, 6],
      [11, 12]
    ]
  });

  system.vel.set([
    [1, 2],
    [3, 4]
  ]);

  const viewport = new algovivo.SystemViewport({ system, headless: true });
  expect(system.pos.toArray()).toBeCloseToArray([[5, 6], [11, 12]]);
  expect(system.vel.toArray()).toBeCloseToArray([[1, 2], [3, 4]]);
  viewport.fixVertex(1);
  expect(system.pos.toArray()).toBeCloseToArray([[5, 6], [11, 12]]);
  expect(system.vel.toArray()).toBeCloseToArray([[1, 2], [0, 0]]);
});