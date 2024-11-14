from .args import Args
from .backward_pass_fun import BackwardPassFun

class Fun:
    def __init__(self, name):
        self.args = Args()
        self.name = name
        self.src_body = ""

    def codegen(self):
        src_fun_signature = self.args.codegen_fun_signature()
        return f"""extern \"C\"
float {self.name}({src_fun_signature}) {{
  {self.src_body}
}}"""

    def make_backward_pass(self):
        return BackwardPassFun(self)