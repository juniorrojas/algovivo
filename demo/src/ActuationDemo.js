const minAction = 0.25;
const maxAction = 1;
const height = 240;

export default class ActuationDemo {
  constructor(args = {}) {
    const algovivo = args.algovivo;

    const system = new algovivo.System({ wasmInstance: args.wasmInstance });
    system.set({
      pos: [
        [0, 0],
        [2, 0],
        [1, 1]
      ],
      triangles: [
        [0, 1, 2]
      ],
      muscles: [
        [0, 2]
      ]
    });
    system.triangles.setMu(200);
    system.triangles.setLambda(500);
    this.system = system;

    const viewport = new algovivo.SystemViewport({ system });
    this.viewport = viewport;
    viewport.tracker.visibleWorldWidth = 5;
    viewport.tracker.targetCenterY = 0.8;

    const div = document.createElement("div");
    this.domElement = div;
    div.style.width = "100%";
    div.style.marginTop = "18px";
    div.style.borderRadius = "8px";
    div.style.overflow = "hidden";
    viewport.domElement.style.display = "block";
    viewport.domElement.style.maxWidth = "100%";
    div.appendChild(viewport.domElement);

    const label = document.createElement("div");
    this.label = label;
    label.className = "code2";
    label.style.display = "inline-block";
    label.style.marginTop = "10px";
    div.appendChild(label);

    this.t = 0;
    this.a = maxAction;
    window.addEventListener("resize", () => this.updateSize());
  }

  updateSize() {
    const width = this.domElement.clientWidth;
    if (width == 0) return;
    this.viewport.setSize({ width, height });
    this.render();
  }

  render() {
    this.viewport.render();
    this.label.textContent = `a = ${this.a.toFixed(2)}`;
  }

  step() {
    const u = 0.5 + 0.5 * Math.cos(this.t * 0.06);
    this.a = minAction + (maxAction - minAction) * u;
    this.system.a.set([this.a]);
    this.system.step();
    this.render();
    this.t++;
  }
}
