from pathlib import Path
import os
this_filepath = Path(os.path.realpath(__file__))
this_dirpath = this_filepath.parent
import algovivo_codegen as codegen
from algovivo_codegen import indent
import argparse

arg_parser = argparse.ArgumentParser()
arg_parser.add_argument("-o", "--output-csrc-dirname", type=str, default="csrc")
args = arg_parser.parse_args()

templates_dirpath = this_dirpath.joinpath("algovivo_codegen", "templates")

backward_euler = codegen.BackwardEuler()

backward_euler.potentials = [
    codegen.potentials.Muscles(),
    codegen.potentials.Triangles(),
    codegen.potentials.Gravity(),
    codegen.potentials.Collision(),
    codegen.potentials.Friction()
]

backward_euler.make_loss()
backward_euler_loss_grad = backward_euler.loss.make_backward_pass()
update_args, update_pos_args, update_vel_args = backward_euler.make_update_args()
forward_non_differentiable_args = backward_euler.make_forward_non_differentiable_args()

csrc_dirpath = Path(args.output_csrc_dirname)

with open(templates_dirpath.joinpath("optim.template.h")) as f:
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

with open(templates_dirpath.joinpath("backward_euler.template.h")) as f:
    template = f.read()

    src = template

    src = (src
        .replace("/* {{backward_euler_update_pos_args}} */", update_pos_args.codegen_fun_signature())
        .replace("/* {{backward_euler_update_pos_args_call}} */", update_pos_args.codegen_call().replace(", pos,", ", pos1,"))
    )

    src = (src
        .replace("/* {{backward_euler_update_vel_args}} */", update_vel_args.codegen_fun_signature())
        .replace("/* {{backward_euler_update_vel_args_call}} */", update_vel_args.codegen_call())
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
        .replace("// {{backward_euler_loss_grad_body}}", indent(backward_euler_loss_grad.codegen_body()))
    )

output_filepath = csrc_dirpath.joinpath("dynamics", "backward_euler.h")
with open(output_filepath, "w") as f:
    f.write(src)
print(f"Saved to {output_filepath}")