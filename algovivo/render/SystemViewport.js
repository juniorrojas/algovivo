const mm2d = require("./mm2d");
const Tracker = require("./Tracker");
const Floor = require("./Floor");
const VertexRenderer = require("./VertexRenderer");
const LineRenderer = require("./LineRenderer");

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
    const sortedVertexIds = args.sortedVertexIds;
    this.sortedVertexIds = sortedVertexIds;
    if (args.vertexDepths != null) {
      this.setSortedVertexIdsFromVertexDepths(args.vertexDepths);
    }

    const headless = args.headless ?? false;

    this.vertices = new VertexRenderer({
      system: this.system,
      renderVertexIds: args.renderVertexIds ?? false
    });
    this.lines = new LineRenderer({
      system: this.system
    });

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
    
    mesh.pointShader.renderPoint = this.vertices.makePointShaderFunction({
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
    mesh.lineShader.renderLine = this.lines.makeLineShaderFunction({
      activeMuscleColor: activeMuscleColor,
      inactiveMuscleColor: inactiveMuscleColor,
      borderColor: borderColor
    });

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
              system.vertices.fixedVertexId,
              [worldCursor[0], Math.max(0, worldCursor[1])]
            );
          }
        },
        onDragProgress: (domCursor) => {
          const system = this.system;
          const worldCursor = camera.domToWorldSpace(domCursor);
          this.setVertexPos(
            system.vertices.fixedVertexId,
            [worldCursor[0], Math.max(0, worldCursor[1])]
          );
        },
        onDomCursorUp: () => {
          this.freeVertex();
        }
      });
      if (!headless) {
        const domElementForMoveEvents = args.domElementForMoveEvents ?? null;
        dragBehavior.linkToDom(renderer.domElement, domElementForMoveEvents);
      }
    }
    
    this.tracker = new Tracker();
  }

  setSortedVertexIdsFromVertexDepths(depths) {
    if (depths.length != this.system.numVertices) {
      throw new Error(`invalid size for depths, found ${depths.length}, expected ${this.system.numVertices}`);
    }
    const indexedDepths = depths.map((depth, index) => ({ depth, index }));
    indexedDepths.sort((a, b) => b.depth - a.depth);
    const sortedVertexIds = indexedDepths.map((a) => a.index);
    this.sortedVertexIds = sortedVertexIds;
  }

  setSize(args = {}) {
    this.renderer.setSize({
      width: args.width,
      height: args.height
    });
  }

  render() {
    if (this.needsMeshUpdate == null || this.needsMeshUpdate) {
      this._updateMesh({
        triangles: this.system.getTrianglesArray(),
        muscles: this.system.getMusclesArray()
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
    const numVertices = this.system.numVertices;
    if (!Number.isInteger(numVertices) || numVertices < 0) {
      throw new Error(`invalid number of vertices ${numVertices}`);
    }

    if (meshData.pos != null) {
      mesh.pos = meshData.pos;
    }

    mesh.triangles = meshData.triangles;
    mesh.lines = edgesFromTriangles(meshData.triangles);
    Array.prototype.push.apply(mesh.lines, meshData.muscles);

    const muscleHashToId = new Map();
    meshData.muscles.forEach((m, i) => {
      muscleHashToId.set(
        hashSimplex(m),
        i
      );
    });
    
    const lineIdToMuscleId = [];
    mesh.setCustomAttribute("lineIdToMuscleId", lineIdToMuscleId);
    mesh.lines.forEach(line => {
      const h = hashSimplex(line);
      const muscleId = muscleHashToId.get(h);
      lineIdToMuscleId.push(muscleId);
    });
    
    let sortedVertexIds = this.sortedVertexIds;
    if (sortedVertexIds == null) {
      sortedVertexIds = [];
      for (let i = 0; i < numVertices; i++) {
        sortedVertexIds.push(i);
      }
    }
    if (sortedVertexIds.length != numVertices) {
      throw new Error(`invalid size for sortedVertexIds, found ${sortedVertexIds.length}, expected ${numVertices}`);
    }

    mesh.sortedElements = mm2d.sorted.makeSortedElements({
      sortedVertexIds: sortedVertexIds,
      triangles: mesh.triangles,
      edges: mesh.lines
    });

    const muscleIntensity = [];
    const numMuscles = this.system.numMuscles;
    for (let i = 0; i < numMuscles; i++) {
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

    if (system.numVertices == 0) {
      mesh.pos = [];
    } else {
      const pos = system.pos.toArray();
      mesh.pos = pos;
    }
  }

  _updateMuscleIntensityFromSystem() {
    const mesh = this.mesh;
    const system = this.system;
    const numMuscles = system.numMuscles;

    if (!Number.isInteger(numMuscles) || numMuscles < 0) {
      throw new Error(`invalid number of muscles ${numMuscles}`);
    }

    let muscleIntensity = [];
    
    if (numMuscles > 0) {
      if (system.a) {
        const aF32 = system.a.slot.f32();
        for (let i = 0; i < numMuscles; i++) {
          muscleIntensity.push(aF32[i]);
        }
      } else {
        muscleIntensity = new Array(numMuscles).fill(1);
      }
    }
    
    mesh.setCustomAttribute("muscleIntensity", muscleIntensity);
  }

  hitTestVertex(p, hitTestRadius = 0.31) {
    return this.vertices.hitTest(p, hitTestRadius);
  }

  setVertexPos(i, p) {
    this.vertices.setVertexPos(i, p);
  }

  setVertexVel(i, p) {
    this.vertices.setVertexVel(i, p);
  }

  fixVertex(vertexId) {
    const system = this.system;
    this.setVertexVel(vertexId, [0, 0]);
    if (vertexId == null) {
      vertexId = -1;
    }
    system.vertices.fixVertex(vertexId);
  }

  freeVertex() {
    const system = this.system;
    system.vertices.freeVertex();
  }
}

module.exports = SystemViewport;