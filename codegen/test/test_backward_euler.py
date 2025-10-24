import algovivo_codegen

def test_backward_euler():
    backward_euler = algovivo_codegen.BackwardEuler()
    assert backward_euler.loss is not None