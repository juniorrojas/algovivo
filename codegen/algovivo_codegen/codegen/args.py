class Arg:
    differentiable = False

    def __init__(self, t, name, mut=False):
        self.t = t
        self.name = name
        self.mut = mut

class DifferentiableArg(Arg):
    differentiable = True

    def __init__(self, t, name, num_elements, element_size=1, mut=False):
        super().__init__(t, name, mut=mut)
        self.num_elements = num_elements
        self.element_size = element_size

    @property
    def total_size(self):
        if self.element_size == 1:
            return self.num_elements
        return f"{self.num_elements} * {self.element_size}"

class Args:
    def __init__(self):
        self.args = []

    def __len__(self):
        return len(self.args)
    
    def __getitem__(self, i):
        return self.args[i]

    def add_arg(self, t, name, mut=False):
        self.args.append(Arg(t, name, mut))

    def add_differentiable_arg(self, t, name, num_elements, element_size=1, mut=False):
        self.args.append(DifferentiableArg(t, name, num_elements, element_size, mut))

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

    def codegen_call_with_renames(self, renames):
        s = ""
        num_args = len(self.args)
        for i, arg in enumerate(self.args):
            name = arg.name
            s += renames.get(name, name)
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

    # TODO the methods below are coupled with the optimization method,
    # consider moving them into optimizers/ in the future

    def codegen_optim_zero_grads(self):
        lines = []
        for arg in self.get_differentiable_args():
            lines.append(f"zero_({arg.total_size}, {arg.name}_grad);")
        return " \\\n  ".join(lines)

    def codegen_optim_line_search_update(self):
        # write trial values to _tmp buffers for line search evaluation
        lines = []
        for arg in self.get_differentiable_args():
            lines.append(f"add_scaled({arg.total_size}, {arg.name}, {arg.name}_grad, -step_size, {arg.name}_tmp);")
        return " \\\n  ".join(lines)

    def codegen_optim_apply_step(self):
        lines = []
        for arg in self.get_differentiable_args():
            lines.append(f"add_scaled({arg.total_size}, {arg.name}, {arg.name}_grad, -step_size, {arg.name});")
        return " \\\n  ".join(lines)

    def codegen_optim_call_with_tmp(self):
        # use _tmp buffers for line search loss evaluation
        s = ""
        num_args = len(self.args)
        for i, arg in enumerate(self.args):
            name = arg.name
            if arg.differentiable:
                s += f"{name}_tmp"
            else:
                s += name
            if i < num_args - 1:
                s += ", "
        return s

    def codegen_optim_converged_args(self):
        # generate args for optim_converged function
        parts = []
        for arg in self.get_differentiable_args():
            if arg.element_size == 1:
                parts.append(f"{arg.total_size}, {arg.name}_grad")
            else:
                parts.append(f"{arg.total_size}, {arg.element_size}, {arg.name}_grad")
        return ", ".join(parts)

    def codegen_optim_converged_signature(self):
        # generate function signature for optim_converged
        parts = []
        for arg in self.get_differentiable_args():
            if arg.element_size == 1:
                parts.append(f"int {arg.name}_size, const float* {arg.name}_grad")
            else:
                parts.append(f"int {arg.name}_total_size, int {arg.name}_stride, const float* {arg.name}_grad")
        return ", ".join(parts)

    def codegen_optim_converged_body(self):
        # generate body of optim_converged that checks all differentiable grads
        lines = []
        for arg in self.get_differentiable_args():
            if arg.element_size == 1:
                # flat check (each float individually)
                lines.append(f"""for (int k = 0; k < {arg.name}_size; k++) {{
    float q = {arg.name}_grad[k] * {arg.name}_grad[k];
    if (q > grad_max_q) grad_max_q = q;
  }}""")
            else:
                # per-entity magnitude check (sum over element components)
                lines.append(f"""{{
    int {arg.name}_num = {arg.name}_total_size / {arg.name}_stride;
    for (int k = 0; k < {arg.name}_num; k++) {{
      int offset = k * {arg.name}_stride;
      float q = 0.0;
      for (int j = 0; j < {arg.name}_stride; j++) {{
        q += {arg.name}_grad[offset + j] * {arg.name}_grad[offset + j];
      }}
      if (q > grad_max_q) grad_max_q = q;
    }}
  }}""")
        return "\n  ".join(lines)