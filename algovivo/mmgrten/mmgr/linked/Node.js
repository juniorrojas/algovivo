class Node {
  constructor(list, data) {
    this.list = list;
    this.data = data;
    this.next = null;
    this.prev = null;
  }

  append(data) {
    const node = new Node(this.list, data);

    if (this.list.last == this) this.list.last = node;
    
    node.next = this.next;
    node.prev = this;

    if (this.next != null) this.next.prev = node;

    this.next = node;
    this.list.size++;

    return node;
  }

  prepend(data) {
    const node = new Node(this.list, data);
    
    if (this.list.first == this) this.list.first = node;

    node.next = this;
    node.prev = this.prev;

    if (this.prev != null) this.prev.next = node;

    this.prev = node;
    this.list.size++;

    return node;
  }

  remove() {
    if (this.prev != null) this.prev.next = this.next;
    if (this.next != null) this.next.prev = this.prev;
    if (this.list.first == this) this.list.first = this.next;
    if (this.list.last == this) this.list.last = this.prev;
    this.list.size--;

    this.next = null;
    this.prev = null;
  }
}

module.exports = Node;