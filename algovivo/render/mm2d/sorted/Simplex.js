class Simplex {
  constructor(id, vertexIds) {
    if (id == null) {
      throw new Error("id required to create simplex");
    }
    this.order = vertexIds.length;
    this.id = id;
    this.vertexIds = vertexIds;
  }

  toString() {
    return JSON.stringify({
      order: this.order,
      id: this.id,
      vertexIds: this.vertexIds
    });
  }
}

module.exports = Simplex;