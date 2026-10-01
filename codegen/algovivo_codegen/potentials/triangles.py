from .. import Fun
from ..neohookean import Neohookean

class Triangles:
    def __init__(self):
        pass

    def get_src(self):
        neohookean = Neohookean(
            simplex_order=3,
            simplex_name_singular="triangle"
        )
        return "\n" + neohookean.codegen_accumulate_simplices_energy()

    def make_energy_fn(self, name="triangle_energy"):
        f = Fun(name)
        f.args.add_arg("int", "num_triangles")
        f.args.add_arg("int*", "triangles")
        f.args.add_arg("float*", "rsi")
        f.args.add_arg("float*", "mu")
        f.args.add_arg("float*", "lambda")
        f.args.add_differentiable_arg("float*", "pos", num_elements="num_vertices", element_size="space_dim")
        f.src_body = "float potential_energy = 0.0;" + self.get_src() + "return potential_energy;"
        return f

    def add_to_loss(self, be):
        be.loss_body += self.get_src()
