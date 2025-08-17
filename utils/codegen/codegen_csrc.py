from pathlib import Path
import os
this_filepath = Path(os.path.realpath(__file__))
this_dirpath = this_filepath.parent
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
        codegen.modules.Collision(),
        codegen.modules.Friction()
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

    csrc_dirpath = Path(args.output_csrc_dirname)
    backward_euler.instantiate_templates(csrc_dirpath)