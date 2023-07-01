const Mesh = require("./Mesh");

class Renderer {
  constructor() {
    const canvas = document.createElement("canvas");
    this.domElement = canvas;
    this.ctx = canvas.getContext("2d");

    this.setSize({
      width: 200,
      height: 200
    });
  }

  setSize(args) {
    const width = args.width;
    if (width == null) throw new Error("width required to setSize");
    const height = args.height;
    if (height == null) throw new Error("height required to setSize");

    let viewportWidth = args.viewportWidth;
    if (viewportWidth == null) {
      viewportWidth = width;
    }
    let viewportHeight = args.viewportHeight;
    if (viewportHeight == null) {
      viewportHeight = height;
    }

    this.width = width;
    this.height = height;
    
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;

    const canvas = this.domElement;
    canvas.width = viewportWidth;
    canvas.height = viewportHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  renderPoint(renderer, mesh, camera, id, customArgs) {
    const ctx = this.ctx;
    let xi;
    if (mesh instanceof Mesh) xi = mesh.x[id];
    else {
      throw new Error("invalid mesh");
    }
    const p = camera.transform.apply(xi);
    ctx.save();
    mesh.pointShader.renderPoint({
      ctx: ctx,
      renderer: renderer,
      mesh: mesh,
      camera: camera,
      id: id,
      p: p,
      custom: customArgs
    });
    ctx.restore();
  }

  renderLine(renderer, mesh, camera, id, customArgs) {
    const ctx = this.ctx;
    const line = mesh.lines[id];
    const a = camera.transform.apply(mesh.x[line[0]]);
    const b = camera.transform.apply(mesh.x[line[1]]);
    
    ctx.save();
    mesh.lineShader.renderLine({
      ctx: ctx,
      renderer: renderer,
      mesh: mesh,
      camera: camera,
      id: id,
      a: a,
      b: b,
      custom: customArgs
    });
    ctx.restore();
  }

  renderTriangle(renderer, mesh, camera, id, customArgs) {
    const ctx = this.ctx;
    const triangle = mesh.triangles[id];

    const ia = triangle[0];
    const ib = triangle[1];
    const ic = triangle[2];

    let _a, _b, _c;
    if (mesh.x instanceof Float32Array) {
      const spaceDim = 2;
      _a = [mesh.x[ia * spaceDim], mesh.x[ia * spaceDim + 1]];
      _b = [mesh.x[ib * spaceDim], mesh.x[ib * spaceDim + 1]];
      _c = [mesh.x[ic * spaceDim], mesh.x[ic * spaceDim + 1]];
    } else {
      _a = mesh.x[ia];
      _b = mesh.x[ib];
      _c = mesh.x[ic];
    }

    const a = camera.transform.apply(_a);
    const b = camera.transform.apply(_b);
    const c = camera.transform.apply(_c);

    ctx.save();
    mesh.triangleShader.renderTriangle({
      ctx: ctx,
      renderer: renderer,
      mesh: mesh,
      camera: camera,
      id: id,
      a: a,
      b: b,
      c: c,
      custom: customArgs
    });
    ctx.restore();
  }

  renderMesh(renderer, mesh, camera, customArgs = {}) {
    const sortedElements = mesh.sortedElements;

    if (sortedElements == null) {
      for (let i = 0; i < mesh.triangles.length; i++) {
        this.renderTriangle(renderer, mesh, camera, i, customArgs);
      }

      for (let i = 0; i < mesh.lines.length; i++) {
        this.renderLine(renderer, mesh, camera, i, customArgs);
      }
      
      for (let i = 0; i < mesh.x.length; i++) {
        this.renderPoint(renderer, mesh, camera, i, customArgs);
      }
    } else {
      sortedElements.forEach((element) => {
        if (element.order == 1) {
          this.renderPoint(renderer, mesh, camera, element.id, customArgs);
        } else
        if (element.order == 2) {
          this.renderLine(renderer, mesh, camera, element.id, customArgs);
        } else
        if (element.order == 3) {
          this.renderTriangle(renderer, mesh, camera, element.id, customArgs);
        } else {
          throw new Error(`invalid element ${element}`);
        }
      });
    }
  }

  render(scene, camera, customArgs = {}) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);
    
    scene.meshes.forEach((mesh) => {
      this.renderMesh(
        this,
        mesh,
        camera,
        customArgs
      );
    });
  }
}

module.exports = Renderer;