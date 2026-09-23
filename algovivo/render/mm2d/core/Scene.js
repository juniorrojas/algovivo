import Mesh from "./Mesh.js";

export default class Scene {
  constructor() {
    this.meshes = [];
  }

  clean() {
    this.meshes = [];
  }

  numMeshes() {
    return this.meshes.length;
  }

  addMesh() {
    const mesh = new Mesh({
      scene: this
    });
    this.meshes.push(mesh);
    return mesh;
  }
}
