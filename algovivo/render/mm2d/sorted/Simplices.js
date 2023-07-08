const Simplex = require("./Simplex");

function hashSimplex(vids) {
  vids.sort();
  return vids.join("_");
}

class Simplices {
  constructor(args = {}) {
    if (args.order == null) throw new Error("order required");
    this.order = args.order;
    this.simplicesByHash = new Map();
  }

  forEach(f) {
    this.simplicesByHash.forEach(f);
  }

  size() {
    return this.simplicesByHash.size;
  }

  has(simplex) {
    return this.simplicesByHash.has(hashSimplex(simplex.vertexIds));
  }

  add(simplex, id) {
    let vertexIds = null;
    if (Array.isArray(simplex)) {
      if (id == null) throw new Error("id required");
      vertexIds = simplex;
      simplex = new Simplex(id, vertexIds);
    } else {
      vertexIds = simplex.vertexIds;
      if (vertexIds == null) {
        throw new Error(`vertexIds required ${simplex}`);
      }
      id = simplex.id;
    }
    if (vertexIds.length != this.order) {
      throw new Error(`expected ${this.order} vertices, found ${vertexIds.length}`);
    }
    const h = hashSimplex(vertexIds);
    this.simplicesByHash.set(h, simplex);
    return simplex;
  }
}

module.exports = Simplices;