const Node = require("./Node");

class ListIter {
  constructor(list) {
    this.list = list;
    this.nextNode = this.list.first;
  }

  next() {
    if (this.nextNode == null) {
      return {
        done: true
      };
    } else {
      const r = {
        done: false,
        value: this.nextNode.data
      };
      this.nextNode = this.nextNode.next;
      return r;
    }
  }
}

class List {
  constructor() {
    this.first = null;
    this.last = null;
    this.size = 0;
  }

  isEmpty() {
    if (
      (this.first == null && this.last != null) || 
      (this.first != null && this.last == null)
    ) {
      throw Error("inconsistent first last state");
    }
    return this.first == null;
  }

  append(data) {
    if (this.isEmpty()) {
      return this.setSingleton(data);
    } else {
      return this.last.append(data);
    }
  }

  prepend(data) {
    if (this.isEmpty()) {
      return this.setSingleton(data);
    } else {
      return this.first.prepend(data);
    }
  }

  setSingleton(data) {
    const node = new Node(this, data);
    this.first = node;
    this.last = node;
    this.size = 1;
    return node;
  }

  iter() {
    return new ListIter(this);
  }

  *[Symbol.iterator]() {
    const it = this.iter();
    let r = it.next();
    while (!r.done) {
      yield r.value;
      r = it.next();
    }
  }
}

module.exports = List;