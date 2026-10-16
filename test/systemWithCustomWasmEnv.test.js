import { test } from "node:test";
import assert from "node:assert";
import * as algovivo from "algovivo";
import * as utils from "./utils.js";

async function loadTen() {
  const ten = new algovivo.mmgrten.Engine();
  const wasmInstance = await utils.loadWasm({
    env: {
      malloc: (x) => {
        return ten.memoryManager.malloc(Number(x));
      },
      free: (x) => {
        return ten.memoryManager.free(Number(x));
      }
    }
  });
  ten.init({ wasmInstance });
  return ten;
}

test("system", async () => {
  const ten = await loadTen();
  const system = new algovivo.System({ ten });
  assert.strictEqual(system.numVertices, 0);
  assert.strictEqual(system.numMuscles, 0);
  assert.strictEqual(system.numTriangles, 0);

  system.set({
    pos: [
      [1, 2]
    ]
  });

  assert.strictEqual(system.numVertices, 1);
  utils.assertCloseToArray(system.pos.toArray(), [[1, 2]]);
  utils.assertCloseToArray(system.vel.toArray(), [[0, 0]]);
});