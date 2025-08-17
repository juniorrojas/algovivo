class Collision:
    def add_args(self, args):
        args.add_arg("float", "k_collision")

    def add_update_args(self, args):
        self.add_args(args)