class Triangles:
    def __init__(self):
        pass

    def add_args(self, args):
        args.add_arg("int", "num_triangles")
        args.add_arg("int*", "triangles")
        args.add_arg("float*", "rsi")
        args.add_arg("float*", "mu")
        args.add_arg("float*", "lambda")

    def add_update_args(self, args):
        self.add_args(args)