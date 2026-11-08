from .args import Args
from .backward_pass_fun import BackwardPassFun

class Fun:
    def __init__(self, name, export_grad=False):
        self.args = Args()
        self.name = name
        self.src_body = ""

        # TODO consider deferring export_grad to the codegen step instead of setting it at construction,
        # construction time is good enough for current use cases, but open to revisiting it if needed
        self.export_grad = export_grad

    @property
    def num_args(self):
        return len(self.args)

    def codegen(self):
        src_fun_signature = self.args.codegen_fun_signature()
        return f"""extern \"C\"
float {self.name}({src_fun_signature}) {{
  {self.src_body}
}}"""

    def make_backward_pass(self):
        return BackwardPassFun(self)