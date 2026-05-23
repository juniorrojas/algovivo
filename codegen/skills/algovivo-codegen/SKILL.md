---
name: algovivo-codegen
description: Use when the user wants to define or change algovivo's energy functions, generate the C++ source, or build the simulation library (WASM).
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

This generates the C++ source in `csrc`. To compile it, you need the `build.sh` script from the algovivo repo:

```sh
curl -sLO https://raw.githubusercontent.com/juniorrojas/algovivo/main/build.sh
chmod +x build.sh
```

Then run it with Docker:

```sh
python codegen_csrc.py && \
docker run \
  --user $(id -u):$(id -g) \
  -v $(pwd):/workspace \
  -w /workspace \
  ghcr.io/juniorrojas/algovivo/llvm18-enzyme:latest \
  ./build.sh
```

This will generate `build/algovivo.wasm`. For a minimal HTML page that loads the WASM and runs a simulation, see [demo/index.html](demo/index.html). Serve it over HTTP (e.g. `python3 -m http.server`) from the directory that contains both the HTML and the `build/` directory — `fetch` won't work via `file://`.