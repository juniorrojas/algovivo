const algovivo = require("algovivo");
const utils = require("./utils");

expect.extend({ toBeCloseToArray: utils.toBeCloseToArray });

async function loadTen() {
  const ten = new algovivo.mmgrten.Engine();
  const wasmInstance = await utils.loadWasm({
    env: {
      malloc: (x) => {
        return ten.mgr.malloc(Number(x));
      },
      free: (x) => {
        return ten.mgr.free(Number(x));
      }
    }
  });
  ten.init({ wasmInstance });
  return ten;
}

test("system", async () => {
  const ten = await loadTen();
  const system = new algovivo.System({ ten });
  expect(system.numVertices).toBe(0);
  expect(system.numMuscles).toBe(0);
  expect(system.numTriangles).toBe(0);

  system.set({
    pos: [
      [1, 2]
    ]
  });

  expect(system.numVertices).toBe(1);
  expect(system.pos.toArray()).toBeCloseToArray([[1, 2]]);
  expect(system.vel.toArray()).toBeCloseToArray([[0, 0]]);
});