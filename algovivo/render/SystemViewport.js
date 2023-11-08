const Tracker = require("./Tracker");
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

function makePointShaderFunction(args = {}) {
  const radius = args.radius ?? 0.028;
  const borderColor = args.borderColor ?? "black";
  const fillColor = args.fillColor ?? "white";
  const borderWidth = args.borderWidth ?? 0.023;

  return (args) => {
    const ctx = args.ctx;
    const p = args.p;
    const camera = args.camera;
    const scale = camera.inferScale();
    
    const radius1 = (radius + borderWidth) * scale;
    ctx.fillStyle = borderColor;
    ctx.beginPath();
    ctx.arc(p[0], p[1], radius1, 0, 2 * Math.PI);
    ctx.fill();

    const radius2 = radius * scale;
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(p[0], p[1], radius2, 0, 2 * Math.PI);
    ctx.fill();
  }
}

class Floor {
  constructor(args = {}) {
    if (args.scene == null) {
      throw new Error("scene required");
    }
    const scene = this.scene = args.scene;
    const mesh = this.mesh = scene.addMesh();
    mesh.x = [
      [-10, 0],
      [10, 0]
    ];
    mesh.lines = [
      [0, 1]
    ];

    mesh.lineShader.renderLine = Floor.makeFloorLineShaderFunction({
      width: args.width,
      color: args.color
    });

    mesh.pointShader.renderPoint = () => {};

    mesh.setCustomAttribute("translation", [0, 0]);
  }

  static makeFloorLineShaderFunction(args = {}) {
    const width = args.width ?? 0.055;
    const color = args.color ?? "black";
    return (args) => {
      const ctx = args.ctx;
      const a = args.a;
      const b = args.b;
      const camera = args.camera;
      const mesh = args.mesh;
      const scale = camera.inferScale();

      const _translation = mesh.getCustomAttribute("translation");
      const translation = [scale * _translation[0], scale * _translation[1]];

      ctx.strokeStyle = color;
      ctx.lineWidth = scale * width;
      ctx.beginPath();
      ctx.moveTo(a[0] + translation[0], a[1] + translation[1]);
      ctx.lineTo(b[0] + translation[0], b[1] + translation[1]);
      ctx.stroke();
    }
  }
}

function hexToRgb(hex) {
  if (hex.length != 7) {
    throw new Error(`invalid hex string ${hex}`);
  }
  if (hex[0] != "#") {
    throw new Error(`invalid hex string ${hex}, expected #, found ${hex[0]}`);
  }
  hex = hex.substring(1);
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return [r, g, b];
}

class SystemViewport {
  constructor(args = {}) {
    if (args.system == null) {
      throw new Error("system required");
    }
    this.system = args.system;
    this.sortedVertexIds = args.sortedVertexIds;

    const headless = args.headless ?? false;

    const renderer = new mm2d.Renderer({ headless });
    this.renderer = renderer;
    this.domElement = renderer.domElement;
    this.setSize({
      width: args.width ?? 400,
      height: args.height ?? 400
    });

    const scene = new mm2d.Scene();
    this.scene = scene;

    const camera = new mm2d.Camera();
    this.camera = camera;

    const borderColor = args.borderColor ?? "black";
    const floorColor = borderColor;
    const fillColor = args.fillColor ?? "white";
    const gridColor = args.gridColor ?? "#acadad";
    
    let activeMuscleColor = args.activeMuscleColor ?? [255, 0, 0];
    let inactiveMuscleColor = args.inactiveMuscleColor ?? [250, 190, 190];
    if (typeof activeMuscleColor === "string") {
      activeMuscleColor = hexToRgb(activeMuscleColor);
    }
    if (typeof inactiveMuscleColor === "string") {
      inactiveMuscleColor = hexToRgb(inactiveMuscleColor)
    }

    let backgroundCenterColor, backgroundOuterColor;
    if (args.backgroundColor != null) {
      backgroundCenterColor = args.backgroundColor;
      backgroundOuterColor = args.backgroundColor;
    } else {
      backgroundCenterColor = args.backgroundCenterColor ?? "#fcfcfc";
      backgroundOuterColor = args.backgroundOuterColor ?? "#d7d8d8";
    }

    const background = new mm2d.background.Background({
      scene: scene,
      color1: backgroundCenterColor,
      color2: backgroundOuterColor
    });

    const gridInnerCells = 2;
    const gridPrimaryLineWidth = 0.022;
    const gridSecondaryLineWidth = 0.005;
    const grid = this.grid = new mm2d.background.Grid({
      scene: scene,
      x0: -3,
      y0: 0,
      rows: 4,
      cols: 10,

      innerCells: gridInnerCells,
      primaryLineWidth: gridPrimaryLineWidth,
      secondaryLineWidth: gridSecondaryLineWidth,
      color: gridColor
    });

    // TODO this should not be necessary if grid.set used previously assigned attributes
    grid.innerCells = gridInnerCells;
    grid.primaryLineWidth = gridPrimaryLineWidth;
    grid.secondaryLineWidth = gridSecondaryLineWidth;
    // grid.color = gridColor;

    const floor = this.floor = new Floor({
      scene: scene,
      color: floorColor
    });

    const mesh = scene.addMesh();
    this.mesh = mesh;
    
    mesh.pointShader.renderPoint = makePointShaderFunction({
      borderColor: borderColor,
      fillColor: fillColor
    });

    mesh.triangleShader.renderTriangle = (args = {}) => {
      const ctx = args.ctx;
      const a = args.a;
      const b = args.b;
      const c = args.c;

      ctx.beginPath();
      ctx.fillStyle = fillColor;
      ctx.moveTo(...a);
      ctx.lineTo(...b);
      ctx.lineTo(...c);
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
        ctx.beginPath();
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth * scale;
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.closePath();
        ctx.stroke();
      } else {
        const color0 = activeMuscleColor;
        const color1 = inactiveMuscleColor;
        
        const width = 0.065;
        const borderWidth = 0.017;
        const lineCap = "butt";
        const muscleIntensityAttributeName = "muscleIntensity";

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

    const draggable = args.draggable ?? true;
    if (draggable) {
      const dragBehavior = this.dragBehavior = new mm2d.ui.DragBehavior({
        onDomCursorDown: (domCursor, event) => {
          if ("button" in event && event.button != 0) return;
          const system = this.system;
          const worldCursor = camera.domToWorldSpace(domCursor);
          const vertexId = this.hitTestVertex(worldCursor);
          if (vertexId != null) {
            this.fixVertex(vertexId);
            dragBehavior.beginDrag();
            this.setVertexPos(
              system.fixedVertexId,
              [worldCursor[0], Math.max(0, worldCursor[1])]
            );
          }
        },
        onDragProgress: (domCursor) => {
          const system = this.system;
          const worldCursor = camera.domToWorldSpace(domCursor);
          this.setVertexPos(
            system.fixedVertexId,
            [worldCursor[0], Math.max(0, worldCursor[1])]
          );
        },
        onDomCursorUp: () => {
          this.freeVertex();
        }
      });
      if (!headless) dragBehavior.linkToDom(renderer.domElement);
    }
    
    this.tracker = new Tracker();
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
      if (this.system.triangles != null) {
        const trianglesU32 = this.system.triangles.u32();
        for (let i = 0; i < this.system.numTriangles(); i++) {
          const offset = i * 3;
          trianglesArr.push([
            trianglesU32[offset    ],
            trianglesU32[offset + 1],
            trianglesU32[offset + 2]
          ]);
        }
      }

      const springsArr = [];
      if (this.system.springs != null) {
        const springsU32 = this.system.springs.u32();
        for (let i = 0; i < this.system.numSprings(); i++) {
          const offset = i * 2;
          springsArr.push([
            springsU32[offset    ],
            springsU32[offset + 1]
          ]);
        }
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

    this._updateFromSystem();

    if (this.dragBehavior == null || !this.dragBehavior.dragging()) {
      this.tracker.step({
        mesh: mesh,
        camera: camera,
        floor: this.floor,
        grid: this.grid,
        renderer: this.renderer
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
    if (this.system.springs != null) {
      const springsU32 = this.system.springs.u32();
      for (let i = 0; i < this.system.numSprings(); i++) {
        const offset = i * 2;
        const s = [
          springsU32[offset    ],
          springsU32[offset + 1]
        ];
        springsHashToId.set(
          hashSimplex(s),
          i
        );
      }
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
    if (sortedVertexIds.length != this.system.numVertices()) {
      throw new Error(`invalid size for sortedVertexIds, found ${sortedVertexIds.length}, expected ${this.system.numVertices()}`);
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

  _updateFromSystem() {
    this._updateVertexPositionsFromSystem();
    this._updateMuscleIntensityFromSystem();
  }

  _updateVertexPositionsFromSystem() {
    const mesh = this.mesh;
    const system = this.system;

    if (system.numVertices() == 0) {
      mesh.x = [];
    } else {
      const x = system.x0.toArray();
      mesh.x = x;
    }
  }

  _updateMuscleIntensityFromSystem() {
    const mesh = this.mesh;
    const system = this.system;
    const muscleIntensity = [];
    const numSprings = system.numSprings();
    if (numSprings > 0) {
      const aF32 = system.a.slot.f32();
      for (let i = 0; i < numSprings; i++) {
        muscleIntensity.push(aF32[i]);
      }
    }
    mesh.setCustomAttribute("muscleIntensity", muscleIntensity);
  }

  hitTestVertex(p, hitTestRadius = 0.31) {
    const numVertices = this.system.numVertices();
    if (numVertices == 0) return null;
    const xF32 = this.system.x0.slot.f32();
    let closestVertex = null;
    let closestQuadrance = Infinity;
    const hitTestRadius2 = hitTestRadius * hitTestRadius;
    for (let i = 0; i < numVertices; i++) {
      const offset = i * 2;
      const xi = [xF32[offset], xF32[offset + 1]];
      const d = mm2d.math.Vec2.sub(xi, p);
      const q = mm2d.math.Vec2.quadrance(d);
      if (q < hitTestRadius2 && q < closestQuadrance) {
        closestVertex = i;
        closestQuadrance = q;
      }
    }
    return closestVertex;
  }

  setVertexPos(i, p) {
    const system = this.system;
    const xF32 = system.x0.slot.f32();
    const offset = i * 2;
    xF32[offset] = p[0];
    xF32[offset + 1] = p[1];
  }

  setVertexVel(i, p) {
    const system = this.system;
    const vF32 = system.v0.slot.f32();
    const offset = i * 2;
    vF32[offset] = p[0];
    vF32[offset + 1] = p[1];
  }

  fixVertex(vertexId) {
    const system = this.system;
    this.setVertexVel(vertexId, [0, 0]);
    if (vertexId == null) {
      vertexId = -1;
    }
    system.fixedVertexId = vertexId;
  }

  freeVertex() {
    const system = this.system;
    system.fixedVertexId = -1;
  }
}

module.exports = SystemViewport;