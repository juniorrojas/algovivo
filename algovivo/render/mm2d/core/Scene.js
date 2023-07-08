const Mesh = require("./Mesh");

class Scene {
  constructor() {
    this.meshes = new Map();
  }

  clean() {
    this.meshes = new Map();
  }

  numMeshes() {
    return this.meshes.size;
  }

  addMesh() {
    const id = this.meshes.size;
    const mesh = new Mesh({
      scene: this,
      id: id
    });
    this.meshes.set(id, mesh);
    return mesh;
  }
}

module.exports = Scene;