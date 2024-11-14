def indent(s):
    return "\n".join("  " + line for line in s.split("\n"))

class BackwardPassFun:
    def __init__(self, primal):
        self.primal = primal
        self.args = self.primal.args.with_tangent_args()

    @property
    def name(self):
        return f"{self.primal.name}_grad"

    def codegen(self):
        grad_args = self.args
        src_grad_fun_signature = grad_args.codegen_fun_signature()

        src_grad_fun_body = self.codegen_body()

        return f"""extern \"C\"
void {self.name}({src_grad_fun_signature}) {{
  {src_grad_fun_body}
}}"""
    
    def codegen_body(self):
        primal_args = self.primal.args

        enzyme_args_call = primal_args.codegen_enzyme_call()
        src_grad_fun_body = f"""__enzyme_autodiff(
{indent(self.primal.name)},
{indent(enzyme_args_call)}
);"""

        return src_grad_fun_body