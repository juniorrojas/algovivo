from pathlib import Path
import os
this_filepath = Path(os.path.realpath(__file__))
this_dirpath = this_filepath.parent
import codegen
from backward_euler import BackwardEuler

def indent(s):
    return "\n".join("  " + line for line in s.split("\n"))

backward_euler = BackwardEuler()

backward_euler_loss = backward_euler.loss
backward_euler_loss_args = backward_euler_loss.args

backward_euler_loss_args.add_arg("float", "g")
backward_euler_loss_args.add_arg("float", "h")

# vertices
backward_euler_loss_args.add_arg("int", "num_vertices")
backward_euler_loss_args.add_arg("float*", "pos", differentiable=True)
backward_euler_loss_args.add_arg("float*", "pos0")
backward_euler_loss_args.add_arg("float*", "vel0")
backward_euler_loss_args.add_arg("float", "vertex_mass")

# muscles
backward_euler_loss_args.add_arg("int", "num_muscles")
backward_euler_loss_args.add_arg("int*", "muscles")
backward_euler_loss_args.add_arg("float", "k")
backward_euler_loss_args.add_arg("float*", "a")
backward_euler_loss_args.add_arg("float*", "l0")

# triangles
backward_euler_loss_args.add_arg("int", "num_triangles")
backward_euler_loss_args.add_arg("int*", "triangles")
backward_euler_loss_args.add_arg("float*", "rsi")
backward_euler_loss_args.add_arg("float", "mu")
backward_euler_loss_args.add_arg("float", "lambda")

# friction
backward_euler_loss_args.add_arg("float", "k_friction")

backward_euler_loss_grad = backward_euler_loss.make_backward_pass()
backward_euler_loss_grad_args = backward_euler_loss_grad.args

system_attrs = codegen.Args()
for arg in backward_euler_loss_args.args:
    if not arg.differentiable:
        system_attrs.add_arg(arg.t, arg.name)
system_attrs.add_arg("int", "fixed_vertex_id")

update_args = codegen.Args()
for arg in system_attrs.args:
    update_args.add_arg(arg.t, arg.name)

for arg in backward_euler_loss_args.args:
    if arg.differentiable:
        update_args.add_arg(arg.t, f"{arg.name}1", mut=True)
        update_args.add_arg(arg.t, f"{arg.name}_grad", mut=True)
        update_args.add_arg(arg.t, f"{arg.name}_tmp", mut=True)
        if arg.name == "pos":
            update_args.add_arg(arg.t, f"vel1", mut=True)
        else:
            update_args.add_arg(arg.t, f"{arg.name}_v1", mut=True)



enzyme_args_call = backward_euler_loss_args.codegen_enzyme_call()
backward_euler_loss_grad_body = backward_euler_loss_grad.codegen_body()

with open(this_dirpath.joinpath("system.template.h")) as f:
    template = f.read()
    
    src = template

    backward_euler_loss_body_args = backward_euler_loss_args.codegen_fun_signature()
    
    src = (src
        .replace("// {{backward_euler_loss_body}}", backward_euler.loss_body)
        .replace("// {{backward_euler_loss_args}}", backward_euler_loss_body_args)
        .replace("// {{backward_euler_loss_args_call}}", backward_euler_loss_args.codegen_call())
        .replace("// {{backward_euler_loss_grad_args}}", backward_euler_loss_grad_args.codegen_fun_signature())
        .replace("// {{backward_euler_loss_grad_args_call}}", backward_euler_loss_grad_args.codegen_call())
        .replace("// {{backward_euler_loss_grad_body}}", indent(backward_euler_loss_grad_body))
    )

    src = (src
        .replace("// {{system_attrs}}", indent(system_attrs.codegen_struct_attrs()))
        .replace("// {{backward_euler_update_args}}", indent(update_args.codegen_fun_signature()))
        .replace("// {{system_set}}", indent(system_attrs.codegen_struct_set("system")))
        .replace("/* {{system_forward_args}} */", "float* pos")
        .replace("/* {{system_backward_args}} */", "float* pos, float* pos_grad")
    )

output_filepath = this_dirpath.parent.parent.joinpath("csrc", "algovivo", "system.h")
with open(output_filepath, "w") as f:
    f.write(src)
print(f"Saved to {output_filepath}")

backward_euler_update_pos_args = codegen.Args()
backward_euler_update_pos_args.add_arg("float*", "pos", mut=True)
backward_euler_update_pos_args.add_arg("float*", "pos_grad", mut=True)
backward_euler_update_pos_args.add_arg("float*", "pos_tmp", mut=True)

with open(this_dirpath.joinpath("backward_euler.template.h")) as f:
    template = f.read()

    src = template.replace(
        "/* {{backward_euler_update_pos_args}} */",
        backward_euler_update_pos_args.codegen_fun_signature()
    )
    src = src.replace(
        "/* {{backward_euler_update_vel_args}} */",
        "int num_vertices, const float* pos0, const float* vel0, float* pos1, float* vel1, float h"
    )
    src = src.replace(
        "/* {{backward_euler_update_args}} */",
        "float* pos1, float* vel1, float* pos_grad, float* pos_tmp"
    )

output_filepath = this_dirpath.parent.parent.joinpath("csrc", "algovivo", "dynamics", "backward_euler.h")
with open(output_filepath, "w") as f:
    f.write(src)
print(f"Saved to {output_filepath}")