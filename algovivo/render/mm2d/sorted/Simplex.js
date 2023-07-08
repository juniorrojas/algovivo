class Simplex {
  constructor(id, vertexIds) {
    if (id == null) {
      throw new Error("id required to create simplex");
    }
    this.order = vertexIds.length;
    this.id = id;
    this.vertexIds = vertexIds;
  }
}

module.exports = Simplex;