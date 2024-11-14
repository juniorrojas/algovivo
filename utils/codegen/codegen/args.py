class Arg:
    def __init__(self, t, name, differentiable=False, mut=False):
        self.t = t
        self.name = name
        self.differentiable = differentiable
        self.mut = mut

class Args:
    def __init__(self):
        self.args = []

    def __len__(self):
        return len(self.args)

    def add_arg(self, t, name, differentiable=False, mut=False):
        arg = Arg(t, name, differentiable, mut)
        self.args.append(arg)

    def codegen_fun_signature(self):
        s = ""
        num_args = len(self.args)
        for i, arg in enumerate(self.args):
            t, name = arg.t, arg.name
            if t[-1] == "*" and not arg.mut:
                s += "const "
            s += f"{t} {name}"
            if i < num_args - 1:
                s += ", "
        return s
    
    def codegen_call(self):
        s = ""
        num_args = len(self.args)
        for i, arg in enumerate(self.args):
            t, name = arg.t, arg.name
            s += f"{name}"
            if i < num_args - 1:
                s += ", "
        return s
    
    def codegen_enzyme_call(self):
        s = ""
        num_args = len(self.args)
        for i, arg in enumerate(self.args):
            t, name = arg.t, arg.name
            if not arg.differentiable:
                s += f"enzyme_const, {name}"
            else:
                s += f"enzyme_dup, {name}, {name}_grad"
            if i < num_args - 1:
                s += ",\n"
        return s
    
    def codegen_struct_attrs(self):
        s = ""
        for arg in self.args:
            t, name = arg.t, arg.name
            if t[-1] == "*" and not arg.mut:
                s += "const "
            s += f"{t} {name};\n"
        return s
    
    def codegen_struct_set(self, struct_name):
        s = ""
        for arg in self.args:
            t, name = arg.t, arg.name
            s += f"{struct_name}.{name} = {name};\n"
        return s
    
    def with_tangent_args(self):
        new_args = Args()
        for arg in self.args:
            new_args.add_arg(arg.t, arg.name)
            if arg.differentiable:
                new_args.add_arg(f"{arg.t}", f"{arg.name}_grad")
        return new_args