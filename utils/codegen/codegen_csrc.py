from pathlib import Path
import os
this_filepath = Path(os.path.realpath(__file__))
this_dirpath = this_filepath.parent
import algovivo_codegen as codegen
from algovivo_codegen import indent

backward_euler = codegen.BackwardEuler()

backward_euler_loss_grad = backward_euler.loss.make_backward_pass()

update_args = codegen.Args()
for arg in backward_euler.loss.args:
    if not arg.differentiable:
        update_args.add_arg(arg.t, arg.name)
update_args.add_arg("int", "fixed_vertex_id")

for arg in backward_euler.loss.args:
    if arg.differentiable:
        update_args.add_arg(arg.t, f"{arg.name}1", mut=True)
        update_args.add_arg(arg.t, f"{arg.name}_grad", mut=True)
        update_args.add_arg(arg.t, f"{arg.name}_tmp", mut=True)
        if arg.name == "pos":
            update_args.add_arg(arg.t, f"vel1", mut=True)
        else:
            update_args.add_arg(arg.t, f"{arg.name}_v1", mut=True)

enzyme_args_call = backward_euler.loss.args.codegen_enzyme_call()
backward_euler_loss_grad_body = backward_euler_loss_grad.codegen_body()

forward_non_differentiable_args = codegen.Args()
for arg in backward_euler.loss.args:
    if not arg.differentiable:
        forward_non_differentiable_args.add_arg(arg.t, arg.name)

csrc_dirpath = this_dirpath.parent.parent.joinpath("csrc")

with open(this_dirpath.joinpath("templates", "optim.template.h")) as f:
    template = f.read()
    
    src = template
    src = template.replace(
        "/* {{forward_non_differentiable_args}} */",
        forward_non_differentiable_args.codegen_call()
    )

output_filepath = csrc_dirpath.joinpath("dynamics", "optim.h")
with open(output_filepath, "w") as f:
    f.write(src)
print(f"Saved to {output_filepath}")

backward_euler_update_pos_args = codegen.Args()

for arg in backward_euler.loss.args:
    if not arg.differentiable:
        backward_euler_update_pos_args.add_arg(arg.t, arg.name)

for arg in backward_euler.loss.args:
    if arg.differentiable:
        backward_euler_update_pos_args.add_arg(arg.t, f"{arg.name}", mut=True)
        backward_euler_update_pos_args.add_arg(arg.t, f"{arg.name}_grad", mut=True)
        backward_euler_update_pos_args.add_arg(arg.t, f"{arg.name}_tmp", mut=True)
backward_euler_update_pos_args.add_arg("int", "fixed_vertex_id")

backward_euler_update_vel_args = codegen.Args()
backward_euler_update_vel_args.add_arg("int", "num_vertices")
backward_euler_update_vel_args.add_arg("int", "space_dim")
backward_euler_update_vel_args.add_arg("float*", "pos0")
backward_euler_update_vel_args.add_arg("float*", "vel0")
backward_euler_update_vel_args.add_arg("float*", "pos1", mut=True)
backward_euler_update_vel_args.add_arg("float*", "vel1", mut=True)
backward_euler_update_vel_args.add_arg("float", "h")

with open(this_dirpath.joinpath("templates", "backward_euler.template.h")) as f:
    template = f.read()

    src = template

    src = (src
        .replace("/* {{backward_euler_update_pos_args}} */", backward_euler_update_pos_args.codegen_fun_signature())
        .replace("/* {{backward_euler_update_pos_args_call}} */", backward_euler_update_pos_args.codegen_call().replace(", pos,", ", pos1,"))
    )

    src = (src
        .replace("/* {{backward_euler_update_vel_args}} */", backward_euler_update_vel_args.codegen_fun_signature())
        .replace("/* {{backward_euler_update_vel_args_call}} */", backward_euler_update_vel_args.codegen_call())
    )

    src = src.replace(
        "/* {{backward_euler_update_args}} */",
        indent(update_args.codegen_fun_signature())
    )

    src = (src
        .replace("// {{backward_euler_loss_body}}", backward_euler.loss_body)
        .replace("// {{backward_euler_loss_args}}", backward_euler.loss.args.codegen_fun_signature())
        .replace("// {{backward_euler_loss_args_call}}", backward_euler.loss.args.codegen_call())
        .replace("// {{backward_euler_loss_grad_args}}", backward_euler_loss_grad.args.codegen_fun_signature())
        .replace("// {{backward_euler_loss_grad_args_call}}", backward_euler_loss_grad.args.codegen_call())
        .replace("// {{backward_euler_loss_grad_body}}", indent(backward_euler_loss_grad_body))
    )

output_filepath = csrc_dirpath.joinpath("dynamics", "backward_euler.h")
with open(output_filepath, "w") as f:
    f.write(src)
print(f"Saved to {output_filepath}")