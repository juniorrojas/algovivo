from .codegen import Fun, Args, indent
from pathlib import Path
import os
this_filepath = Path(os.path.realpath(__file__))
this_dirpath = this_filepath.parent

class BackwardEuler:
    def __init__(self):
        self.loss = Fun("backward_euler_loss")
        self.modules = []
        self.inertial_modules = []
        self.potentials = []

        self.update_pos_body = """_optim_init();
  const auto max_optim_iters = 100;
  for (int i = 0; i < max_optim_iters; i++) {
    loss_backward();
    break_if_optim_converged();
    optim_step();
  }"""

    def make_loss(self):
        self.loss.args.add_arg("int", "space_dim")
        self.loss.args.add_arg("float", "g")
        self.loss.args.add_arg("float", "h")

        for module in self.modules:
            module.add_args(self.loss.args)

        self.loss.args.add_arg("float*", "pos", differentiable=True)
        
        self.loss_body = """
float inertial_energy = 0.0;
float potential_energy = 0.0;"""

        self.add_inertia()

        for potential in self.potentials:
            potential.add_to_loss(self)

        self.loss_body += "return 0.5 * inertial_energy + h * h * potential_energy;"

        self.loss_body = indent(self.loss_body)

    def make_update_args(self):
        update_args = Args()

        update_args.add_arg("int", "space_dim")
        update_args.add_arg("float", "g")
        update_args.add_arg("float", "h")

        for module in self.modules:
            module.add_update_args(update_args)

        update_pos_args = Args()

        for arg in self.loss.args:
            if not arg.differentiable:
                update_pos_args.add_arg(arg.t, arg.name)

        for module in self.inertial_modules:
            module.add_update_pos_args(update_pos_args)
        
        update_vel_args = Args()
        for module in self.inertial_modules:
            module.add_update_vel_args(update_vel_args)

        return update_args, update_pos_args, update_vel_args
    
    def make_forward_non_differentiable_args(self):
        forward_non_differentiable_args = Args()
        for arg in self.loss.args:
            if not arg.differentiable:
                forward_non_differentiable_args.add_arg(arg.t, arg.name)
        return forward_non_differentiable_args

    def add_inertia(self):
        self.loss_body += """
for (int i = 0; i < num_vertices; i++) {
  accumulate_inertial_energy(
    inertial_energy,
    i,
    pos,
    vel0,
    pos0,
    h,
    vertex_mass,
    space_dim
  );
}"""

    def instantiate_templates(self, csrc_dirpath):
        self.make_loss()
        loss_grad = self.loss.make_backward_pass()
        update_args, update_pos_args, update_vel_args = self.make_update_args()
        forward_non_differentiable_args = self.make_forward_non_differentiable_args()

        templates_dirpath = this_dirpath.joinpath("templates")
        
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
                .replace("/* {{backward_euler_update_pos_body}} */", self.update_pos_body)
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
                .replace("// {{backward_euler_loss_body}}", self.loss_body)
                .replace("// {{backward_euler_loss_args}}", self.loss.args.codegen_fun_signature())
                .replace("// {{backward_euler_loss_args_call}}", self.loss.args.codegen_call())
                .replace("// {{backward_euler_loss_grad_args}}", loss_grad.args.codegen_fun_signature())
                .replace("// {{backward_euler_loss_grad_args_call}}", loss_grad.args.codegen_call())
                .replace("// {{backward_euler_loss_grad_body}}", indent(loss_grad.codegen_body()))
            )

        output_filepath = csrc_dirpath.joinpath("dynamics", "backward_euler.h")
        with open(output_filepath, "w") as f:
            f.write(src)
        print(f"Saved to {output_filepath}")