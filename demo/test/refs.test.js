import { test } from "node:test";
import assert from "node:assert";
import fs from "fs";
import { buildRef, dataRef } from "../src/refs.js";
import snippetForAgent from "../src/snippet.js";

function uniqueRefs(readme, pattern) {
  return [...new Set([...readme.matchAll(pattern)].map(m => m[1]))];
}

test("refs match the ones pinned in the README", () => {
  const readme = fs.readFileSync(`${import.meta.dirname}/../../README.md`, "utf8");

  const buildRefs = uniqueRefs(readme, /algovivo@([0-9a-f]+)\/build\//g);
  const dataRefs = uniqueRefs(readme, /algovivo@([0-9a-f]+)\/demo\/public\/data\//g);

  assert.deepStrictEqual(buildRefs, [buildRef]);
  assert.deepStrictEqual(dataRefs, [dataRef]);
});

test("snippet targets the given agent", () => {
  const snippet = snippetForAgent("quadruped");

  assert.ok(snippet.includes(`/data/quadruped/mesh.json`));
  assert.ok(snippet.includes(`/data/quadruped/policy.json`));
  assert.ok(snippet.includes("</script>"));
});
