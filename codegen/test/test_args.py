from algovivo_codegen.codegen import Arg, DifferentiableArg, Args


def test_arg_vs_differentiable_arg():
    assert Arg("int", "num_vertices").differentiable is False
    assert DifferentiableArg("float*", "x", num_elements="n").differentiable is True


def test_total_size_is_derived_from_num_elements_and_element_size():
    assert DifferentiableArg("float*", "x", num_elements="n").total_size == "n"
    assert DifferentiableArg("float*", "x", num_elements="n", element_size=3).total_size == "n * 3"
    assert DifferentiableArg(
        "float*", "pos", num_elements="num_vertices", element_size="space_dim"
    ).total_size == "num_vertices * space_dim"


# TODO this should probably be moved to optimizer-related tests
def test_convergence_check_groups_by_element_size():
    flat = Args()
    flat.add_differentiable_arg("float*", "x", num_elements="n")
    assert flat.codegen_optim_converged_signature() == "int x_size, const float* x_grad"

    grouped = Args()
    grouped.add_differentiable_arg("float*", "pos", num_elements="num_vertices", element_size="space_dim")
    assert grouped.codegen_optim_converged_signature() == (
        "int pos_total_size, int pos_stride, const float* pos_grad"
    )
