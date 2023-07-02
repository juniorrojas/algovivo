const Simplices = require("./Simplices");
const Vertex = require("./Vertex");

class MeshTopology {
  constructor(args = {}) {
    this.vertices = new Map();
    this.edges = new Simplices({ order: 2 });
    this.triangles = new Simplices({ order: 3 });
    
    const edges = args.edges ?? [];
    edges.forEach((e, i) => {
      this.addEdge(i, e);
    });
    
    const triangles = args.triangles ?? [];
    triangles.forEach((t, i) => {
      this.addTriangle(i, t);
    });
  }

  numVertices() {
    return this.vertices.size;
  }

  numEdges() {
    return this.edges.size();
  }

  numTriangles() {
    return this.triangles.size();
  }

  getVertexById(id, create = false) {
    let vertex = this.vertices.get(id);
    if (vertex == null && create) {
      vertex = new Vertex(id);
      this.vertices.set(id, vertex);
    }
    return vertex;
  }

  addEdge(id, vertexIds) {
    const edge = this.edges.add(vertexIds, id);
    vertexIds.forEach(vid => {
      this.getVertexById(vid, true).addEdge(edge);
    });
    return edge;
  }

  addTriangle(id, vertexIds) {
    const triangle = this.triangles.add(vertexIds, id);
    vertexIds.forEach(vid => {
      this.getVertexById(vid, true).addTriangle(triangle);
    });
    return triangle;
  }
}

module.exports = MeshTopology;