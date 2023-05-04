const algovivo = require("algovivo");
const utils = require("./utils");

test("test", async () => {
  const system = new algovivo.System({
    wasmInstance: await utils.loadWasm()
  });
  const memoryManager = system.ten.mgr;

  expect(system.numVertices()).toBe(0);
  expect(system.numSprings()).toBe(0);
  expect(system.numTriangles()).toBe(0);

  const mesh = {};
  mesh.triangles = [];
  mesh.x = [
    [0, 0],
    [1, 0],
    [1, 1]
  ];
  mesh.triangles = [
    [0, 1, 2]
  ];
  mesh.springs = [
    [0, 1],
    [2, 1]
  ];

  expect(memoryManager.numReservedBytes()).toBe(0);
  system.set(mesh);
  expect(memoryManager.numReservedBytes()).not.toBe(0);
  const reservedBytes = memoryManager.numReservedBytes();
  expect(system.numVertices()).toBe(3);
  expect(system.numTriangles()).toBe(1);
  expect(system.numSprings()).toBe(2);
  // updating the mesh again with the same data
  // should not allocate any new memory
  system.set(mesh);
  expect(memoryManager.numReservedBytes()).toBe(reservedBytes);

  // free memory
  system.dispose();
  expect(memoryManager.numReservedBytes()).toBe(0);
});