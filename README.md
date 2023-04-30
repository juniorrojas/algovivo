# algovivo

[![test](https://github.com/juniorrojas/algovivo/actions/workflows/test.yml/badge.svg)](https://github.com/juniorrojas/algovivo/actions/workflows/test.yml)

A JavaScript + WebAssembly implementation of an energy-based formulation for soft-bodied virtual creatures.

## [live demo](https://juniorrojas.com/algovivo)

<a href="https://juniorrojas.com/algovivo">
  <img src="media/locomotion.gif" width="250px">
</a>

Instead of implementing simulations using explicit position update rules and manually derived force functions, we can implement simulations using gradient-based optimization on differentiable energy functions and compute forces using automatic differentiation.

For example, AD can be used for [energy minimization](https://github.com/juniorrojas/hookean-springs-pytorch) and [numerical integration](https://github.com/juniorrojas/springs-integration-pytorch) for mass-spring systems. This repository contains an implementation with additional energy terms such as Neo-Hookean triangles, controllable muscles and friction, to simulate soft-bodied virtual creatures. The energy functions are implemented in C++, compiled to LLVM IR, differentiated with [Enzyme AD](https://github.com/EnzymeAD/Enzyme), compiled to WASM, and wrapped as a JavaScript library.

## quick start

To use in the browser, you can download the compiled ES6 module [algovivo.min.mjs](build/algovivo.min.mjs) and compiled WASM [algovivo.wasm](./build/algovivo.wasm).

You can create a simple simulation with one triangle, two muscles and one muscle controlled with a periodic signal, by adding the following code inside a `<script type="module"></script>` tag in your HTML page.

<img src="media/periodic.gif" width="250px">

```js
import algovivo from "./algovivo.min.mjs";

async function loadWasm() {
  const wasm = await WebAssembly.instantiateStreaming(
    await fetch("algovivo.wasm")
  );
  return wasm.instance;
}

async function main() {
  const system = new algovivo.System({
    wasmInstance: await loadWasm()
  });
  system.set({
    x: [
      [0, 0],
      [2, 0],
      [1, 1]
    ],
    triangles: [
      [0, 1, 2]
    ],
    springs: [
      [0, 2],
      [1, 2]
    ]
  });

  const viewport = new algovivo.SystemViewport({ system });
  document.body.appendChild(viewport.domElement);

  let t = 0;
  setInterval(() => {
    system.a.set([
      1,
      0.2 + 0.8 * (Math.cos(t * 0.1) * 0.5 + 0.5)
    ]);
    t++;

    system.step();
    viewport.render();
  }, 1000 / 30);
}

main();
```

To view the example, you need to run a local HTTP server to serve the files. One simple way to do this is to use Python's built-in HTTP server module.

```
python -m http.server 8000
```

Open a web browser and go to `http://localhost:8000`.

<img src="media/periodic.gif" width="250px">

## BibTeX

To cite this in an academic context, please use the following BibTeX entry:

```bibtex
@misc{algovivo,
  author = {Junior Rojas},
  title = {Algovivo: An energy-based formulation for soft-bodied virtual creatures},
  howpublished = {\url{https://github.com/juniorrojas/algovivo}},
  year = {2023}
}
```
