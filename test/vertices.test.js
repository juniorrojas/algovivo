const algovivo = require("algovivo");
const utils = require("./utils");

expect.extend({ toBeCloseToArray: utils.toBeCloseToArray });

test("set vertices", async () => {
  const ten = await utils.loadTen();
  const vertices = new algovivo.Vertices({ ten });
  expect(vertices.numVertices).toBe(0);

  vertices.set([
    [0, 0],
    [3, 0],
    [2, 4]
  ]);

  expect(vertices.numVertices).toBe(3);
  expect(vertices.pos.toArray()).toBeCloseToArray([
    [0, 0],
    [3, 0],
    [2, 4]
  ]);
});

test("set system vertices", async () => {
  const ten = await utils.loadTen();
  const system = new algovivo.System({ ten });
  expect(system.numVertices).toBe(0);

  system.setVertices([
    [0, 0],
    [3, 0],
    [2, 4]
  ]);

  expect(system.numVertices).toBe(3);
  expect(system.pos.toArray()).toBeCloseToArray([
    [0, 0],
    [3, 0],
    [2, 4]
  ]);
});