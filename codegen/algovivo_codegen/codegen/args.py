class Arg:
    def __init__(self, t, name, differentiable=False, mut=False, size=None):
        self.t = t
        self.name = name
        self.differentiable = differentiable
        self.mut = mut
        self.size = size # size expression for differentiable arrays

class Args:
    def __init__(self):
        self.args = []

    def __len__(self):
        return len(self.args)
    
    def __getitem__(self, i):
        return self.args[i]

    def add_arg(self, t, name, differentiable=False, mut=False, size=None):
        arg = Arg(t, name, differentiable, mut, size)
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

    def get_differentiable_args(self):
        return [arg for arg in self.args if arg.differentiable]

    # TODO: the methods below are coupled with the optimization method,
    # consider moving to a separate optimizer codegen module in the future

    def codegen_zero_all_grads(self):
        lines = []
        for arg in self.get_differentiable_args():
            if arg.size is None:
                raise ValueError(f"differentiable arg '{arg.name}' must have a size")
            lines.append(f"zero_({arg.size}, {arg.name}_grad);")
        return " \\\n  ".join(lines)

    def codegen_save_differentiable_params(self, inertial_arg_name="pos"):
        lines = []
        for arg in self.get_differentiable_args():
            if arg.name == inertial_arg_name:
                continue
            if arg.size is None:
                raise ValueError(f"differentiable arg '{arg.name}' must have a size")
            lines.append(f"copy_({arg.size}, {arg.name}, {arg.name}_saved);")
        return " \\\n  ".join(lines)

    def codegen_line_search_update(self, inertial_arg_name="pos"):
        lines = []
        for arg in self.get_differentiable_args():
            if arg.size is None:
                raise ValueError(f"differentiable arg '{arg.name}' must have a size")
            if arg.name == inertial_arg_name:
                lines.append(f"add_scaled({arg.size}, {inertial_arg_name}, {inertial_arg_name}_grad, -step_size, {inertial_arg_name}_tmp);")
            else:
                lines.append(f"add_scaled({arg.size}, {arg.name}_saved, {arg.name}_grad, -step_size, {arg.name});")
        return " \\\n  ".join(lines)

    def codegen_line_search_restore(self, inertial_arg_name="pos"):
        lines = []
        for arg in self.get_differentiable_args():
            if arg.name == inertial_arg_name:
                continue
            if arg.size is None:
                raise ValueError(f"differentiable arg '{arg.name}' must have a size")
            lines.append(f"copy_({arg.size}, {arg.name}_saved, {arg.name});")
        return " \\\n  ".join(lines)

    def codegen_apply_final_step(self):
        lines = []
        for arg in self.get_differentiable_args():
            if arg.size is None:
                raise ValueError(f"differentiable arg '{arg.name}' must have a size")
            lines.append(f"add_scaled({arg.size}, {arg.name}, {arg.name}_grad, -step_size, {arg.name});")
        return " \\\n  ".join(lines)

    def codegen_call_with_tmp(self, inertial_arg_name="pos"):
        s = ""
        num_args = len(self.args)
        for i, arg in enumerate(self.args):
            name = arg.name
            if arg.differentiable and arg.name == inertial_arg_name:
                s += f"{inertial_arg_name}_tmp"
            else:
                s += name
            if i < num_args - 1:
                s += ", "
        return s