import algovivo_codegen as codegen
import argparse

if __name__ == "__main__":
    arg_parser = argparse.ArgumentParser()
    arg_parser.add_argument("-o", "--output-csrc-dirname", type=str, default="csrc")
    args = arg_parser.parse_args()

    backward_euler = codegen.BackwardEuler()

    backward_euler.modules = [
        codegen.modules.Vertices(),
        codegen.modules.Muscles(),
        codegen.modules.Triangles(),
        codegen.modules.Friction(),
        codegen.modules.Collision()
    ]

    backward_euler.inertial_modules = [
        codegen.modules.Vertices()
    ]

    backward_euler.potentials = [
        codegen.potentials.Muscles(),
        codegen.potentials.Triangles(),
        codegen.potentials.Gravity(),
        codegen.potentials.Collision(),
        codegen.potentials.Friction()
    ]

    backward_euler.init_csrc(args.output_csrc_dirname)
    backward_euler.instantiate_templates(args.output_csrc_dirname)