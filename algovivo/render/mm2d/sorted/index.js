const MeshTopology = require("./MeshTopology");
const Simplices = require("./Simplices");

function makeSortedElements(args = {}) {
  if (args.sortedVertexIds == null) {
    throw new Error("sortedVertexIds required");
  }
  if (args.triangles == null) {
    throw new Error("triangles required");
  }
  if (args.edges == null) {
    throw new Error("edges required");
  }
  const sortedVertexIds = args.sortedVertexIds;
  
  const vertexIdToOrder = new Map();
  sortedVertexIds.forEach((id, order) => {
    vertexIdToOrder.set(id, order);
  });

  const triangleTopology = new MeshTopology({
    triangles: args.triangles
  });
  const edgeTopology = new MeshTopology({
    edges: args.edges
  });
  
  const sortedElements = [];
  const trianglesAdded = new Simplices({ order: 3 });
  const edgesAdded = new Simplices({ order: 2 });

  sortedVertexIds.forEach((vertexId) => {
    const triangles = triangleTopology.getVertexById(vertexId, true).triangles;
    const edges = edgeTopology.getVertexById(vertexId, true).edges;

    const sortedSimplices = [];
    triangles.forEach(t => {
      sortedSimplices.push(t);
    });
    edges.forEach(e => {
      sortedSimplices.push(e);
    });

    sortedSimplices.sort((a, b) => {
      // TODO max order vertex could pre-sorted in the simplex
      const aOrders = a.vertexIds.map(i => vertexIdToOrder.get(i));
      const bOrders = b.vertexIds.map(i => vertexIdToOrder.get(i));
      const ai1 = Math.max(...aOrders);
      const bi1 = Math.max(...bOrders);
      if (ai1 < bi1) {
        return 1;
      } else
      if (ai1 == bi1) {
        return 0;
      } else {
        return -1;
      }
    });

    sortedSimplices.forEach(simplex => {
      if (simplex.order == 2) {
        const edge = simplex;
        if (!edgesAdded.has(edge)) {
          sortedElements.push(edge);
          edgesAdded.add(edge);
        }
      } else {
        const triangle = simplex;
        if (!trianglesAdded.has(triangle)) {
          sortedElements.push(triangle);
          trianglesAdded.add(triangle);
        }
      }
    });

    sortedElements.push({
      order: 1,
      id: vertexId
    });
  });
  return sortedElements;
}

module.exports = {
  makeSortedElements: makeSortedElements,
  MeshTopology: require("./MeshTopology"),
  Simplex: require("./Simplex"),
  Simplices: require("./Simplices")
};