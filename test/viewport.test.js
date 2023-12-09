const algovivo = require("algovivo");
const utils = require("./utils");

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