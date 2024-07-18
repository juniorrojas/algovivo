import Section from "./Section";

export default class Description {
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
`<p>
The concept of energy minimization is useful to understand physical systems as goal-directed systems.
A deformable object that tends to recover its rest shape can be understood as a system whose goal is to minimize its elastic potential energy.
More generally, energy can refer to any scalar-valued function that measures compatibility between variables as a means of implicitly capturing their dependencies through energy minimization.
This more general notion of energy is useful to model inertia, friction, actuation mechanisms and, potentially, many other goal-directed behaviors that may or may not be conventionally considered "just physics".
</p>`
    );
    s.setStyle1();

    s = this.addSection(
      "no forces, just energy functions",
`<p>
Much like the loss function encapsulates the objective of a neural network in a single scalar value, potential energy functions offer a scalar representation of the objective of a physical system.
In practice, just as we typically do not compute neural network gradients by hand, we can also avoid computing forces by hand.
The force can be straightforwardly derived as the negative gradient of the potential energy.
For general energy functions that are not plain potential energy functions, the negative gradient cannot be directly interpreted as a force, but it can still be used for gradient-based optimization and is useful for implicit numerical integration methods.
</p>`);

    s = this.addSection(
      "six energy functions",
`<p>
This implementation defines six energy functions. Some are plain potential energy functions, that is, functions of vertex positions <span class="code">E(pos)</span>. Actuation mechanisms can be modeled with an action-dependent energy function <span class="code">E(pos, a)</span>. Other energy functions may also depend on the previous state, given by vertex positions and velocities <span class="code">(pos0, vel0)</span>.
</p>

<ul>
<li>triangles <span class="code">E(pos)</span></li>
<li>muscles <span class="code">E(pos, a)</span></li>
<li>gravity <span class="code">E(pos)</span></li>
<li>collision <span class="code">E(pos)</span></li>
<li>friction <span class="code">E(pos, pos0)</span></li>
<li>inertia <span class="code">E(pos, pos0, vel0)</span></li>
</ul>`
    );
    s.setStyle1();
  }

  addSection(title, content) {
    const section = new Section(title, content);
    this.domElement.appendChild(section.domElement);
    return section;
  }
}