const mm2d = require("./mm2d");

function hashSimplex(vids) {
  vids.sort();
  return vids.join("_");
}

function edgesFromTriangles(triangles) {
  const edges = new Map();
  
  function addEdge(i1, i2) {
    const hash = hashSimplex([i1, i2]);
    edges.set(hash, [i1, i2]);
  }

  triangles.forEach(t => {
    addEdge(t[0], t[1]);
    addEdge(t[1], t[2]);
    addEdge(t[0], t[2]);
  });
  return Array.from(edges.values());
}

class SimViewport {
  constructor(args = {}) {
    if (args.system == null) {
      throw new Error("system required");
    }
    this.system = args.system;

    const renderer = new mm2d.core.Renderer();
    renderer.domElement.style.border = "1px solid black";
    renderer.setSize({
      width: 400,
      height: 400
    });
    this.renderer = renderer;
    this.domElement = renderer.domElement;

    const scene = new mm2d.core.Scene();
    this.scene = scene;

    const camera = new mm2d.core.Camera();
    this.camera = camera;

    const background = new mm2d.background.Background({
      scene: scene
    });
    const grid = this.grid = new mm2d.background.Grid({
      scene: scene,
      x0: -3,
      y0: 0,
      rows: 4,
      cols: 10,
      innerCells: 2,
      primaryLineWidth: 0.022,
      secondaryLineWidth: 0.005,
      color: "#acadad"
    });
    const floor = this.floor = new mm2d.custom.Floor({
      scene: scene
    });

    const mesh = scene.addMesh();
    this.mesh = mesh;

    const muscleMesh = scene.addMesh();
    this.muscleMesh = muscleMesh;
    
    mesh.pointShader.renderPoint = mm2d.custom.makePointShader();

    mesh.triangleShader.renderTriangle = (args = {}) => {
      const ctx = args.ctx;
      const a = args.a;
      const b = args.b;
      const c = args.c;
      const camera = args.camera;
      const scale = camera.inferScale();

      ctx.beginPath();
      ctx.fillStyle = "white";
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.lineTo(c[0], c[1]);
      ctx.closePath();
      ctx.fill();
    };
    mesh.lineShader.renderLine = (args = {}) => {
      const ctx = args.ctx;
      const a = args.a;
      const b = args.b;
      const c = args.c;
      const camera = args.camera;
      const scale = camera.inferScale();

      const borderWidth = 0.029;
      const borderColor = "black";
      ctx.beginPath();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = (borderWidth) * scale;
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.closePath();
      ctx.stroke();
    }

    muscleMesh.pointShader.renderPoint = mm2d.custom.makePointShader({});
    
    muscleMesh.lineShader.renderLine = mm2d.custom.makeFiberShader({
    });

    const dragBehavior = this.dragBehavior = new mm2d.ui.DragBehavior({
      onDomCursorDown: (domCursor, event) => {
        if ("button" in event && event.button != 0) return;
        const sim = this.system;
        const worldCursor = camera.domToWorldSpace(domCursor);
        const vertexId = this.hitTestVertex(worldCursor);
        if (vertexId != null) {
          this.fixVertex(vertexId);
          dragBehavior.beginDrag();
          this.setVertexPos(
            sim.fixedVertexId,
            [worldCursor[0], Math.max(0, worldCursor[1])]
          );
        }
      },
      onDragProgress: (domCursor) => {
        const sim = this.system;
        const worldCursor = camera.domToWorldSpace(domCursor);
        this.setVertexPos(
          sim.fixedVertexId,
          [worldCursor[0], Math.max(0, worldCursor[1])]
        );
      },
      onDomCursorUp: () => {
        this.freeVertex();
      }
    });
    dragBehavior.linkToDom(renderer.domElement);

    this.targetCenterX = null;
    this.currentCenterX = null;
  }

  render() {
    if (this.needsMeshUpdate == null || this.needsMeshUpdate) {
      const trianglesArr = [];
      const trianglesU32 = this.system.triangles.u32();
      for (let i = 0; i < this.system.numTriangles(); i++) {
        const offset = i * 3;
        trianglesArr.push([
          trianglesU32[offset    ],
          trianglesU32[offset + 1],
          trianglesU32[offset + 2]
        ]);
      }

      const springsArr = [];
      const springsU32 = this.system.springs.u32();
      for (let i = 0; i < this.system.numSprings(); i++) {
        const offset = i * 2;
        springsArr.push([
          springsU32[offset    ],
          springsU32[offset + 1]
        ]);
      }

      this._updateMesh({
        triangles: trianglesArr,
        springs: springsArr
      });

      this.needsMeshUpdate = false;
    }

    const renderer = this.renderer;
    const scene = this.scene;
    const camera = this.camera;
    const mesh = this.mesh;

    this._updateSim(this.system);

    if (!this.dragBehavior.dragging()) {
      const meshCenter = mesh.computeCenter();
      const meshCenterX = meshCenter[0];

      this.targetCenterX = meshCenterX;

      if (this.currentCenterX == null) {
        this.currentCenterX = this.targetCenterX;
      } else {
        this.currentCenterX += (this.targetCenterX - this.currentCenterX) * 0.5;
      }

      const recenterThreshold = 3;
      const cx = this.currentCenterX;
      const tx = Math.floor(cx / recenterThreshold) * recenterThreshold;
      this.grid.mesh.setCustomAttribute(
        "translation",
        [tx, 0]
      );
      this.floor.mesh.setCustomAttribute(
        "translation",
        [tx, 0]
      );

      const center = [this.currentCenterX, 1];
      camera.center({
        worldCenter: center,
        worldWidth: 3.8,
        viewportWidth: renderer.width,
        viewportHeight: renderer.height,
      });
    }
    
    renderer.render(scene, camera);
  }

  _updateMesh(meshData) {
    const mesh = this.mesh;
    const muscleMesh = this.muscleMesh;

    if (meshData.x != null) {
      mesh.x = meshData.x;
      muscleMesh.x = meshData.x;
    }

    mesh.triangles = meshData.triangles;
    mesh.lines = edgesFromTriangles(meshData.triangles);
    muscleMesh.lines = meshData.springs;

    const muscleIntensity = [];
    const numSprings = muscleMesh.lines.length;
    for (let i = 0; i < numSprings; i++) {
      muscleIntensity.push(1);
    }
    muscleMesh.setCustomAttribute("muscleIntensity", muscleIntensity);
  }

  _updateSim(sim) {
    this.system = sim;
    const mesh = this.mesh;
    const muscleMesh = this.muscleMesh;

    const x = sim.x0.toArray();
    mesh.x = x
    muscleMesh.x = x;

    const muscleIntensity = [];
    const numSprings = sim.numSprings();
    for (let i = 0; i < numSprings; i++) {
      muscleIntensity.push(sim.a.slot.f32()[i]);
    }
    muscleMesh.setCustomAttribute("muscleIntensity", muscleIntensity);
  }

  hitTestVertex(p) {
    const numVertices = this.system.numVertices();
    const xF32 = this.system.x0.slot.f32();
    for (let i = 0; i < numVertices; i++) {
      const offset = i * 2;
      const xi = [xF32[offset], xF32[offset + 1]];
      const d = mm2d.math.Vec2.sub(xi, p);
      const q = mm2d.math.Vec2.quadrance(d);
      if (q < 0.1) {
        return i;
      }
    }
    return null;
  }

  setVertexPos(i, p) {
    const sim = this.system;
    const xF32 = sim.x0.slot.f32();
    const offset = i * 2;
    xF32[offset] = p[0];
    xF32[offset + 1] = p[1];
  }

  setVertexVel(i, p) {
    const sim = this.system;
    const vF32 = sim.v0.slot.f32();
    const offset = i * 2;
    vF32[offset] = p[0];
    vF32[offset + 1] = p[1];
  }

  fixVertex(vertexId) {
    const sim = this.system;
    this.setVertexVel(vertexId, [0, 0]);
    if (vertexId == null) {
      vertexId = -1;
    }
    sim.fixedVertexId = vertexId;
  }

  freeVertex() {
    const sim = this.system;
    sim.fixedVertexId = -1;
  }
}

module.exports = SimViewport;