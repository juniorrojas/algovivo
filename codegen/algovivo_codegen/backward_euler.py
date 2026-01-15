from .codegen import Fun, Args, indent
from pathlib import Path
import shutil
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

    @property
    def src_body(self):
        return self.loss_body

    def make_loss(self):
        self.loss.args.add_arg("int", "space_dim")
        self.loss.args.add_arg("float", "h")

        for potential in self.potentials:
            if hasattr(potential, "add_args"):
                potential.add_args(self.loss.args)

        for module in self.modules:
            module.add_args(self.loss.args)

        self.loss.args.add_arg("float*", "pos", differentiable=True, size="num_vertices * space_dim", convergence_stride="space_dim")

        for module in self.inertial_modules:
            if hasattr(module, "add_differentiable_args"):
                module.add_differentiable_args(self.loss.args)
        
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
        update_args.add_arg("float", "h")

        for potential in self.potentials:
            if hasattr(potential, "add_update_args"):
                potential.add_update_args(update_args)

        for module in self.modules:
            module.add_update_args(update_args)

        update_pos_args = Args()

        for arg in self.loss.args:
            if not arg.differentiable:
                update_pos_args.add_arg(arg.t, arg.name, mut=arg.mut)

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

    def make_update_vel_body(self):
        parts = []
        for module in self.inertial_modules:
            if hasattr(module, "get_update_vel_src"):
                src = module.get_update_vel_src()
                if src:
                    parts.append(src)
        return "\n\n".join(parts) if parts else ""

    def make_optim_init_body(self):
        parts = []
        for module in self.inertial_modules:
            if hasattr(module, "get_optim_init_src"):
                src = module.get_optim_init_src()
                if src:
                    parts.append(src)
        return " \\\n".join(parts) if parts else ""

    def add_inertia(self):
        for module in self.inertial_modules:
            if hasattr(module, "get_inertia_src"):
                src = module.get_inertia_src()
                if src:
                    self.loss_body += "\n" + src

    def make_energy_functions(self):
        energy_fns_src = ""
        for potential in self.potentials:
            if hasattr(potential, "make_energy_fn"):
                fn = potential.make_energy_fn()
                energy_fns_src += fn.codegen() + "\n\n"
        return energy_fns_src

    def instantiate_templates(self, csrc_dirpath):
        if isinstance(csrc_dirpath, str):
            csrc_dirpath = Path(csrc_dirpath)

        includes_src = ""

        for module in self.modules:
            if hasattr(module, "get_src"):
                src = module.get_src()
                output_filepath = csrc_dirpath.joinpath("potentials", f"{module.name}.h")
                with open(output_filepath, "w") as f:
                    f.write("#pragma once\n\n" + src)
                print(f"module {module.name} saved to {output_filepath}")
                includes_src += f"#include \"../potentials/{module.name}.h\"\n"

        self.make_loss()
        energy_fns_src = self.make_energy_functions()
        loss_grad = self.loss.make_backward_pass()
        update_args, update_pos_args, update_vel_args = self.make_update_args()
        forward_non_differentiable_args = self.make_forward_non_differentiable_args()

        templates_dirpath = this_dirpath.joinpath("templates")

        with open(templates_dirpath.joinpath("optim.template.h")) as f:
            template = f.read()

            src = template
            src = src.replace(
                "/* {{optim_zero_grads}} */",
                self.loss.args.codegen_optim_zero_grads()
            )
            src = src.replace(
                "/* {{backward_euler_loss_grad_args_call}} */",
                loss_grad.args.codegen_call()
            )
            src = src.replace(
                "/* {{backward_euler_loss_args_call}} */",
                self.loss.args.codegen_call()
            )
            src = src.replace(
                "/* {{optim_call_with_tmp}} */",
                self.loss.args.codegen_optim_call_with_tmp()
            )
            src = src.replace(
                "/* {{optim_line_search_update}} */",
                self.loss.args.codegen_optim_line_search_update()
            )
            src = src.replace(
                "/* {{optim_apply_step}} */",
                self.loss.args.codegen_optim_apply_step()
            )
            src = src.replace(
                "/* {{optim_converged_args}} */",
                self.loss.args.codegen_optim_converged_args()
            )
            src = src.replace(
                "/* {{optim_converged_signature}} */",
                self.loss.args.codegen_optim_converged_signature()
            )
            src = src.replace(
                "/* {{optim_converged_body}} */",
                self.loss.args.codegen_optim_converged_body()
            )
            optim_init_body = self.make_optim_init_body()
            src = src.replace(
                "/* {{optim_init_body}} */",
                optim_init_body
            )

        output_filepath = csrc_dirpath.joinpath("dynamics", "optim.h")
        with open(output_filepath, "w") as f:
            f.write(src)
        print(f"instantiated optimizer to {output_filepath}")

        with open(templates_dirpath.joinpath("backward_euler.template.h")) as f:
            template = f.read()

            src = template

            # build renames for inertial args that have *1 output buffers
            # pos is always renamed, plus any args from inertial modules with add_differentiable_args
            inertial_arg_renames = {"pos": "pos1"}
            for module in self.inertial_modules:
                if hasattr(module, "add_differentiable_args"):
                    temp_args = Args()
                    module.add_differentiable_args(temp_args)
                    for arg in temp_args.args:
                        if arg.differentiable:
                            inertial_arg_renames[arg.name] = f"{arg.name}1"
            src = (src
                .replace("/* {{backward_euler_update_pos_args}} */", update_pos_args.codegen_fun_signature())
                .replace("/* {{backward_euler_update_pos_args_call}} */", update_pos_args.codegen_call_with_renames(inertial_arg_renames))
                .replace("/* {{backward_euler_update_pos_body}} */", self.update_pos_body)
            )

            update_vel_body = self.make_update_vel_body()
            src = (src
                .replace("/* {{backward_euler_update_vel_args}} */", update_vel_args.codegen_fun_signature())
                .replace("/* {{backward_euler_update_vel_args_call}} */", update_vel_args.codegen_call())
                .replace("/* {{backward_euler_update_vel_body}} */", update_vel_body)
            )

            src = src.replace(
                "/* {{backward_euler_update_args}} */",
                indent(update_args.codegen_fun_signature())
            )

            src = src.replace("// {{includes}}", includes_src)
            src = src.replace("// {{energy_functions}}", energy_fns_src)

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
        print(f"instantiated backward Euler to {output_filepath}")


    def init_csrc(self, csrc_dirname):
        os.makedirs(csrc_dirname, exist_ok=True)
        csrc_dirpath = Path(csrc_dirname)
        codegen_csrc_dirpath = this_dirpath.joinpath("csrc")
        shutil.copytree(codegen_csrc_dirpath, csrc_dirpath, dirs_exist_ok=True)