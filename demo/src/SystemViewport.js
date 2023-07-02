import algovivo from "../../build/algovivo.min.mjs";
const mm2d = algovivo.mm2d;

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

export default class SystemViewport {
  constructor(args = {}) {
    if (args.system == null) {
      throw new Error("system required");
    }
    this.system = args.system;
    this.sortedVertexIds = args.sortedVertexIds;
    console.log(args.sortedVertexIds);

    const renderer = new mm2d.core.Renderer();
    this.renderer = renderer;
    this.domElement = renderer.domElement;
    this.setSize({
      width: 400,
      height: 400
    });

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
      const camera = args.camera;
      const scale = camera.inferScale();

      const lineIdToSpringId = args.mesh.getCustomAttribute("lineIdToSpringId");
      const springId = lineIdToSpringId[args.id];
      if (springId == null) {
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
      } else {
        const color0 = [255, 0, 0];
        const color1 = [250, 190, 190];
        const width = 0.065;
        const borderWidth = 0.017;
        const borderColor = "black";
        const lineCap = "butt";
        const muscleIntensityAttributeName = "muscleIntensity";
        
        // const ctx = args.ctx;
        // const a = args.a;
        // const b = args.b;
        // const mesh = args.mesh;
        // const camera = args.camera;
        // const scale = camera.inferScale();

        ctx.beginPath();
        ctx.lineCap = lineCap;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = (width + borderWidth * 2) * scale;
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();

        ctx.beginPath();

        const muscleIntensity = mesh.getCustomAttribute(muscleIntensityAttributeName);
        if (muscleIntensity == null) {
          throw new Error(`muscle intensity attribute (${muscleIntensityAttributeName}) not found, call setCustomAttribute("${muscleIntensityAttributeName}", value) before rendering.`);
        }
        if (!Array.isArray(muscleIntensity)) {
          throw new Error(`muscle intensity attribute must be an array with values for each fiber, found ${typeof muscleIntensity}`);
        }
        
        const t = muscleIntensity[springId];
        
        const cr0 = color0[0];
        const cr1 = color1[0];

        const cg0 = color0[1];
        const cg1 = color1[1];

        const cb0 = color0[2];
        const cb1 = color1[2];

        const cr = (1 - t) * cr0 + t * cr1;
        const cg = (1 - t) * cg0 + t * cg1;
        const cb = (1 - t) * cb0 + t * cb1;

        ctx.strokeStyle = `rgb(${cr}, ${cg}, ${cb})`;
        ctx.lineCap = lineCap;
        ctx.lineWidth = width * scale;
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);

        ctx.stroke();
      }
    }

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

    this.setStyle();
  }

  setSize(args = {}) {
    this.renderer.setSize({
      width: args.width,
      height: args.height
    });
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

    if (meshData.x != null) {
      mesh.x = meshData.x;
    }

    mesh.triangles = meshData.triangles;
    mesh.lines = edgesFromTriangles(meshData.triangles);

    const springsHashToId = new Map();
    // this.springsHashToId = springsHashToId;
    for (let i = 0; i < this.system.numSprings(); i++) {
      const s = [
        this.system.springs.u32()[i * 2    ],
        this.system.springs.u32()[i * 2 + 1]
      ];
      // console.log(s);
      springsHashToId.set(
        hashSimplex(s),
        i
      );
    }
    
    const lineIdToSpringId = [];
    mesh.setCustomAttribute("lineIdToSpringId", lineIdToSpringId);
    mesh.lines.forEach(line => {
      const h = hashSimplex(line);
      const springId = springsHashToId.get(h);
      lineIdToSpringId.push(springId);
    });
    
    let sortedVertexIds = this.sortedVertexIds;
    if (sortedVertexIds == null) {
      sortedVertexIds = [];
      for (let i = 0; i < this.system.numVertices(); i++) {
        sortedVertexIds.push(i);
      }
    }

    mesh.sortedElements = mm2d.sorted.makeSortedElements({
      sortedVertexIds: sortedVertexIds,
      triangles: mesh.triangles,
      edges: mesh.lines
    });

    const muscleIntensity = [];
    const numSprings = this.system.numSprings();
    for (let i = 0; i < numSprings; i++) {
      muscleIntensity.push(1);
    }
    mesh.setCustomAttribute("muscleIntensity", muscleIntensity);
  }

  _updateSim(sim) {
    this.system = sim;
    const mesh = this.mesh;

    const x = sim.x0.toArray();
    mesh.x = x

    const muscleIntensity = [];
    const numSprings = sim.numSprings();
    for (let i = 0; i < numSprings; i++) {
      muscleIntensity.push(sim.a.slot.f32()[i]);
    }
    mesh.setCustomAttribute("muscleIntensity", muscleIntensity);
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

  setStyle() {
    this.domElement.style.borderRadius = "10px";
    this.domElement.style.border = "2px solid #c9c9c9";
    this.domElement.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.1)";
    
    const mq = window.matchMedia("(max-width: 425px)");
    const updateMq = () => {
      if (mq.matches) {
        this.setSize({ width: 350, height: 350});
      } else {
        this.setSize({ width: 400, height: 400});
      }this
    }
    mq.addEventListener("change", (event) => {
      updateMq();
    });
    updateMq();
  }
}
