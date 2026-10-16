import { test } from "node:test";
import assert from "node:assert";
import * as algovivo from "algovivo";

test("tracker default args", () => {
  const tracker = new algovivo.render.Tracker();
  assert.strictEqual(tracker.visibleWorldWidth, 3.8);
  assert.strictEqual(tracker.targetCenterY, 1);
  assert.strictEqual(tracker.offsetX, 0);
  assert.strictEqual(tracker.centeringSpeedFactor, 0.5);
});

test("tracker custom args", () => {
  const tracker = new algovivo.render.Tracker({
    visibleWorldWidth: 5,
    targetCenterY: 2,
    offsetX: 0.5,
    centeringSpeedFactor: 0.1
  });
  assert.strictEqual(tracker.visibleWorldWidth, 5);
  assert.strictEqual(tracker.targetCenterY, 2);
  assert.strictEqual(tracker.offsetX, 0.5);
  assert.strictEqual(tracker.centeringSpeedFactor, 0.1);
});
