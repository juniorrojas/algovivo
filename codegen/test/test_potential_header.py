import tempfile
from pathlib import Path
import algovivo_codegen as codegen

spring_to_origin_h = """#pragma once

namespace algovivo {

__attribute__((always_inline))
void accumulate_spring_to_origin_energy(float &energy, float px, float py, float k) {
  energy += 0.5f * k * (px * px + py * py);
}

}
"""


class SpringToOrigin:
    def __init__(self, header):
        self.header = header

    def add_args(self, args):
        args.add_arg("float", "k")

    def add_to_loss(self, be):
        be.loss_body += """
for (int i = 0; i < num_vertices; i++) {
  accumulate_spring_to_origin_energy(potential_energy, pos[space_dim * i], pos[space_dim * i + 1], k);
}
"""


def test_potential_header_is_copied_and_included():
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        header = tmp / "spring_to_origin.h"
        header.write_text(spring_to_origin_h)

        be = codegen.BackwardEuler()
        be.modules = [codegen.modules.Vertices()]
        be.inertial_modules = [codegen.modules.Vertices()]
        be.potentials = [SpringToOrigin(header)]
        be.init_csrc(tmp / "csrc")
        be.instantiate_templates(tmp / "csrc")

        assert (tmp / "csrc" / "potentials" / "spring_to_origin.h").read_text() == spring_to_origin_h
        backward_euler_h = (tmp / "csrc" / "dynamics" / "backward_euler.h").read_text()
        assert "#include \"../potentials/spring_to_origin.h\"" in backward_euler_h
