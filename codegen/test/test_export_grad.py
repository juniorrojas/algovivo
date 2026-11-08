import pytest
import algovivo_codegen
from algovivo_codegen import Fun


class SpringToOrigin:
    def __init__(self, export_grad):
        self.export_grad = export_grad

    def make_energy_fn(self, name="spring_to_origin_energy"):
        f = Fun(name, export_grad=self.export_grad)
        f.args.add_arg("float", "k")
        f.args.add_arg("int", "num_vertices")
        f.args.add_differentiable_arg("float*", "pos", num_elements="num_vertices", element_size="space_dim")
        f.src_body = """float energy = 0.0;
for (int i = 0; i < num_vertices * space_dim; i++) energy += 0.5 * k * pos[i] * pos[i];
return energy;"""
        return f


class NoDifferentiableArg:
    def make_energy_fn(self, name="constant_energy"):
        f = Fun(name, export_grad=True)
        f.args.add_arg("float", "c")
        f.src_body = "return c;"
        return f


def energy_functions(potentials):
    backward_euler = algovivo_codegen.BackwardEuler()
    backward_euler.potentials = potentials
    return backward_euler.make_energy_functions()


def test_energy_functions_export_only_the_energy_by_default():
    src = energy_functions([
        algovivo_codegen.potentials.Collision(),
        SpringToOrigin(export_grad=False)
    ])
    assert "float collision_energy(" in src
    assert "float spring_to_origin_energy(" in src
    assert "_grad(" not in src
    assert "__enzyme_autodiff" not in src


def test_export_grad_adds_the_enzyme_gradient_beside_the_energy():
    src = energy_functions([SpringToOrigin(export_grad=True)])
    assert "float spring_to_origin_energy(float k, int num_vertices, const float* pos)" in src
    
    assert "void spring_to_origin_energy_grad(float k, int num_vertices, const float* pos, const float* pos_grad)" in src
    assert "__enzyme_autodiff(" in src
    assert "enzyme_const, k" in src
    assert "enzyme_dup, pos, pos_grad" in src
    assert src.index("float spring_to_origin_energy(") < src.index("void spring_to_origin_energy_grad(")


def test_export_grad_only_for_the_functions_that_ask():
    src = energy_functions([
        algovivo_codegen.potentials.Collision(),
        SpringToOrigin(export_grad=True)
    ])
    assert "spring_to_origin_energy_grad(" in src
    assert "collision_energy_grad(" not in src


def test_export_grad_without_a_differentiable_arg_raises():
    with pytest.raises(ValueError, match="constant_energy asks for its gradient"):
        energy_functions([NoDifferentiableArg()])
