class Muscles:
    def __init__(self):
        pass

    def add_args(self, args):
        args.add_arg("int", "num_muscles")
        args.add_arg("int*", "muscles")
        args.add_arg("float", "k")
        args.add_arg("float*", "a")
        args.add_arg("float*", "l0")

    def add_update_args(self, args):
        self.add_args(args)