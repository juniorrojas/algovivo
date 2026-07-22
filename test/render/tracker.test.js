import * as algovivo from "algovivo";

test("tracker default args", () => {
  const tracker = new algovivo.render.Tracker();
  expect(tracker.visibleWorldWidth).toBe(3.8);
  expect(tracker.targetCenterY).toBe(1);
  expect(tracker.offsetX).toBe(0);
  expect(tracker.centeringSpeedFactor).toBe(0.5);
});

test("tracker custom args", () => {
  const tracker = new algovivo.render.Tracker({
    visibleWorldWidth: 5,
    targetCenterY: 2,
    offsetX: 0.5,
    centeringSpeedFactor: 0.1
  });
  expect(tracker.visibleWorldWidth).toBe(5);
  expect(tracker.targetCenterY).toBe(2);
  expect(tracker.offsetX).toBe(0.5);
  expect(tracker.centeringSpeedFactor).toBe(0.1);
});
