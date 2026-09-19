import fs from "fs";
import { buildRef, dataRef } from "../src/refs.js";
import snippetForAgent from "../src/snippet.js";

function uniqueRefs(readme, pattern) {
  return [...new Set([...readme.matchAll(pattern)].map(m => m[1]))];
}

test("refs match the ones pinned in the README", () => {
  const readme = fs.readFileSync(`${__dirname}/../../README.md`, "utf8");

  const buildRefs = uniqueRefs(readme, /algovivo@([0-9a-f]+)\/build\//g);
  const dataRefs = uniqueRefs(readme, /algovivo@([0-9a-f]+)\/demo\/public\/data\//g);

  expect(buildRefs).toEqual([buildRef]);
  expect(dataRefs).toEqual([dataRef]);
});

test("snippet targets the given agent", () => {
  const snippet = snippetForAgent("quadruped");

  expect(snippet).toContain(`/data/quadruped/mesh.json`);
  expect(snippet).toContain(`/data/quadruped/policy.json`);
  expect(snippet).toContain("</script>");
});
