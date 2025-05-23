import Section from "./Section";

export default class Sections {
  constructor() {
    this.domElement = document.createElement("div");
    this.domElement.style.marginTop = "16px";
    this.domElement.style.textAlign = "left";
    this.domElement.style.color = "#666";
    this.domElement.style.fontSize = "14px";
    this.domElement.style.width = "100%";
    this.domElement.style.display = "flex";
    this.domElement.style.flexDirection = "column";

    let s;

    s = this.addSection(
      "energy-based models for virtual creatures",
`<div style="display: flex; flex-direction: column">
<a href="https://direct.mit.edu/isal/proceedings/isal2024/36/30/123447" style="padding-top: 25px; display: flex; flex-direction: column; align-items: center">
  <img src="icons/doc.svg" style="width: 30px"></img>
  <div>paper [ALIFE 2024]</div>
</a>
<p>
Potential energy minimization is one of the <a href="https://youtu.be/c8iFtaltX-s?si=MDUb20nFhumn1Q3n&t=3553">most basic forms of goal-directed behavior</a>.
A deformable object that tends to recover its original shape can be understood as a system whose goal is to minimize its elastic potential energy.
In the context of <a href="https://youtu.be/MiqLoAZFRSE?t=2177">energy-based models</a>, &ldquo;energy&rdquo; is used to define implicit functions that capture dependencies between variables.
This more general notion of energy is consistent with potential energy, and is also useful to model inertia, friction, neuromuscular control and many other goal-directed behaviors that may or may not be conventionally considered <a href="https://youtu.be/lIHUWOv4nkE?t=629">&ldquo;just physics&rdquo;</a>.
</p>
</div>`
    );
    s.setStyle1();

    s = this.addSection(
      "no forces, just energy functions",
`<p>
Much like the loss function encapsulates in a single scalar value the objective of a neural network during training, potential energy functions offer a scalar representation of the objective of a mechanical system in a dissipative process.
In practice, just as we typically do not compute neural network gradients by hand, we can also avoid computing forces by hand if we use automatic differentiation.
The force is just the negative gradient of the potential energy.
For more general energy functions, which extend beyond potential energy, the negative gradient might not directly represent a force, but it is useful for gradient-based optimization.
</p>`);

    s = this.addSection(
      "six energy functions",
`<p>
This implementation defines six energy functions. Some are plain potential energy functions; that is, functions of vertex positions <span class="code">E(pos)</span>. Actuation mechanisms are modeled with an action-dependent energy function <span class="code">E(pos, a)</span>. Other energy functions may also depend on the previous state, given by vertex positions and velocities <span class="code">(pos0, vel0)</span>.
</p>

<ul>
<li>
  <a href="https://github.com/juniorrojas/algovivo/blob/main/csrc/modules/gravity.h">gravity</a>
  <span class="code">E(pos)</span>
</li>
<li>
  <a href="https://github.com/juniorrojas/algovivo/blob/main/csrc/modules/collision.h">collision</a>
  <span class="code">E(pos)</span>
</li>
<li>
  <a href="https://github.com/juniorrojas/algovivo/blob/main/csrc/modules/muscles.h">muscles</a>
  <span class="code">E(pos, a)</span>
</li>
<li>
  <a href="https://github.com/juniorrojas/algovivo/blob/main/csrc/modules/triangles.h">triangles</a>
  <span class="code">E(pos)</span>
</li>
<li>
  <a href="https://github.com/juniorrojas/algovivo/blob/main/csrc/modules/friction.h">friction</a>
  <span class="code">E(pos, pos0)</span>
</li>
<li>
  <a href="https://github.com/juniorrojas/algovivo/blob/main/csrc/dynamics/inertia.h">inertia</a>
  <span class="code">E(pos, pos0, vel0)</span>
</li>
</ul>`
    );
    s.setStyle1();

    s = this.addSection(
      "no differential equations, just energy minimization",
`<p>
This implementation uses the backward Euler method, which is conventionally presented as an implicit <a class="a2" href="https://github.com/juniorrojas/springs-integration-pytorch">numerical integration</a> method, derived as a numerical solution to a differential equation like f = ma (Newtonian mechanics).
However, what we actually implement in practice to solve the resulting non-linear root finding problem in a reliable manner is a gradient-based optimization method that finds a local minimum of a function that consists of the sum of the six energy functions mentioned before:
</p>

<span class="code2" style="white-space: normal">pos1 = argmin((pos) => E(pos, pos0, vel0, a))</span>

<p>
The velocity is then updated with a simple update rule:
</p>

<span class="code2">vel1 = (pos1 - pos0) / dt</span>

<p>
Many other implicit numerical integration methods share a similar form, where the next state is found by minimizing an energy function.
While the inertial energy term and velocity update rule may vary depending on the specific method used, energy minimization remains central to explaining state transitions.
Instead of viewing these methods as numerical solutions to differential equations, we can view them as energy-based models that capture Newton's first law of motion in an inertial energy term.
</p>`
    );

    s = this.addSection(
      "no Lagrangians, no Hamiltonians, just energy",
      `<p>
Recall that in this context &ldquo;energy&rdquo; is any <a href="https://youtu.be/MiqLoAZFRSE?t=2177">scalar-valued function that measures incompatibility between variables</a>.
When we say inertial energy, we do not mean kinetic energy.
When we say energy minimization, we do not mean Hamiltonian minimization.
It is actually possible to implement <a href="https://github.com/juniorrojas/springs-integration-pytorch?tab=readme-ov-file#total-energy-hamiltonian-conservation">Hamiltonian-preserving methods</a> by &ldquo;energy&rdquo; minimization.
Energy-based models can also easily describe dissipative systems.
<a href="https://www.youtube.com/watch?v=7fRfxiyTKS0">Lagrangians and Hamiltonians cannot really describe dissipative systems</a>.
When we say energy minimization, we mean something akin to the least action principle, except that &ldquo;action&rdquo; has a very specific definition in Lagrangian mechanics, and we are not using that definition here.
We also want to reserve the word &ldquo;action&rdquo; to refer to actuation mechanisms, such as muscle control, which are modeled as action-dependent energy functions.
Whatever variable or function names you prefer to use in your code, the important thing is to have a <a href="https://github.com/juniorrojas/algovivo">working implementation</a> that goes beyond just words and mathematical formulas that may not even be computable.
</p>`);
    s.setStyle1();
  }

  addSection(title, content) {
    const section = new Section(title, content);
    this.domElement.appendChild(section.domElement);
    return section;
  }
}
