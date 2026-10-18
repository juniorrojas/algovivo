// lengths in world units
export const defaultStyle = {
  borderColor: "black",
  fillColor: "white",
  vertex: {
    radius: 0.028,
    borderWidth: 0.023
  },
  edge: {
    width: 0.029
  },
  muscle: {
    width: 0.065,
    borderWidth: 0.017,
    activeColor: [255, 0, 0],
    inactiveColor: [250, 190, 190]
  },
  floor: {
    width: 0.055
  },
  grid: {
    color: "#acadad",
    innerCells: 2,
    primaryLineWidth: 0.022,
    secondaryLineWidth: 0.005
  },
  background: {
    centerColor: "#fcfcfc",
    outerColor: "#d7d8d8"
  },
  camera: {
    visibleWorldWidth: 3.8,
    targetCenterY: 1
  }
};

export function makeStyle(overrides = {}) {
  const style = {};
  for (const [key, value] of Object.entries(defaultStyle)) {
    const override = overrides[key];
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      style[key] = { ...value, ...override };
    } else {
      style[key] = override ?? value;
    }
  }
  return style;
}
