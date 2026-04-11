import Simplices from "./Simplices.js";

export default class Vertex {
  constructor(id) {
    this.id = id;
    this.edges = new Simplices({ order: 2 });
    this.triangles = new Simplices({ order: 3 });
  }

  addTriangle(triangle, id) {
    this.triangles.add(triangle, id);
  }

  addEdge(edge, id) {
    this.edges.add(edge, id);
  }
}
