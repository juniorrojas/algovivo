---
name: algovivo-codegen
description: Use when the user wants to define or change algovivo's energy functions, generate the C++ source, or build the simulation library (WASM or native shared library).
---

algovivo's codegen library helps define energy functions in Python. From those Python definitions it generates C++ source, which you can compile and differentiate with Enzyme, producing either a WASM module or a native shared library.

You can install the codegen library from the GitHub repo:

```sh
pip install "git+https://github.com/juniorrojas/algovivo.git@main#subdirectory=codegen"
```

To use it, define a `codegen_csrc.py` file:

```py
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
        codegen.modules.Gravity(),
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
```

This generates the C++ source in `csrc`. Use the `build.sh` file from the algovivo repo as a reference for compiling it. The build script typically runs inside Docker, using an image provided by algovivo with the LLVM toolchain and Enzyme (for automatic differentiation) pre-installed.