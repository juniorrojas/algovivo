class Muscles {
  constructor(args = {}) {
    const ten = args.ten;
    if (ten == null) throw new Error("ten required");
    this.ten = ten;
  }
}

module.exports = Muscles;