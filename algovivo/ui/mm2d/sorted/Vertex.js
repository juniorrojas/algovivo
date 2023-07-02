const Simplices = require("./Simplices");

class Vertex {
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

module.exports = Vertex;