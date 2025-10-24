class Friction:
    def add_args(self, args):
        args.add_arg("float", "k_friction")

    def add_update_args(self, args):
        self.add_args(args)