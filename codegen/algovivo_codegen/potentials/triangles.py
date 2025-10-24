class Triangles:
    def __init__(self):
        pass

    def add_to_loss(self, be):
        from ..neohookean import Neohookean
        neohookean = Neohookean(
            simplex_order=3,
            simplex_name_singular="triangle"
        )
        be.loss_body += "\n" + neohookean.codegen_accumulate_simplices_energy()