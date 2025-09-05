export default class AgentMini {
  constructor(args = {}) {
    if (!args.mm2d) throw new Error("mm2d required");
    
    this.mm2d = args.mm2d;
    this.shapeColor = args.shapeColor ?? "white";
    this.size = args.size ?? 50;
    this.worldWidth = args.worldWidth ?? 5.2;
    
    this.initContainer();
    this.initRenderer();
    this.initMesh(args);
    this.setupShaders();
    this.render();
    this.setActive(false);
  }

  initContainer() {
    this.domElement = document.createElement("div");
    this.domElement.style.borderRadius = "50px";
    this.domElement.style.width = `${this.size}px`;
    this.domElement.style.height = `${this.size}px`;
    this.domElement.style.pointerEvents = "auto";
  }

  initRenderer() {
    this.renderer = new this.mm2d.Renderer();
    this.renderer.setSize({ width: this.size, height: this.size });
    this.scene = new this.mm2d.Scene();
    this.camera = new this.mm2d.Camera();
    this.domElement.appendChild(this.renderer.domElement);
  }

  initMesh(args) {
    this.mesh = this.scene.addMesh();
    this.mesh.pos = args.pos || [];
    this.mesh.triangles = args.triangles || [];
  }

  setupShaders() {
    this.mesh.pointShader.renderPoint = () => {};
    
    this.mesh.triangleShader.renderTriangle = (args) => {
      this.renderTriangle(args);
    };
  }

  renderTriangle(args) {
    const borderWidth = 0.029;
    const ctx = args.ctx;
    const [a, b, c] = [args.a, args.b, args.c];
    const scale = args.camera.inferScale();

    ctx.beginPath();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = this.shapeColor;
    ctx.lineWidth = (borderWidth * 2) * scale;
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.lineTo(c[0], c[1]);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = this.shapeColor;
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.lineTo(c[0], c[1]);
    ctx.closePath();
    ctx.fill();
  }

  updateMesh({ pos, triangles }) {
    if (pos) this.mesh.pos = pos;
    if (triangles) this.mesh.triangles = triangles;
    this.render();
  }

  setActive(active = true) {
    if (active) {
      this.domElement.style.backgroundColor = "rgba(0, 0, 0, 1)";
    } else {
      this.domElement.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
    }
  }

  setColor(color) {
    this.shapeColor = color;
    this.render();
  }

  render() {
    if (this.mesh.pos && this.mesh.pos.length > 0) {
      const center = this.mesh.computeCenter();
      this.camera.center({
        worldCenter: center,
        worldWidth: this.worldWidth,
        viewportWidth: this.renderer.width,
        viewportHeight: this.renderer.height,
      });
    }
    this.renderer.render(this.scene, this.camera);
  }
}