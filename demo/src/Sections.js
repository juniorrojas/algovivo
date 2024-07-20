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
`<p>
Potential energy minimization is one of the <a href="https://youtu.be/c8iFtaltX-s?si=MDUb20nFhumn1Q3n&t=3553">most basic forms of goal-directed behavior</a>.
A deformable object that tends to recover its rest shape can be understood as a system whose goal is to minimize its elastic potential energy.
More generally, &ldquo;energy&rdquo; in the context of <a href="https://youtu.be/MiqLoAZFRSE?t=2177">energy-based models</a> refers to any implicit function that captures dependencies between variables.
This more general notion of energy is consistent with potential energy, but is also useful to model inertia, friction, actuation mechanisms and many other goal-directed behaviors that may or may not be conventionally considered <a href="https://youtu.be/lIHUWOv4nkE?t=629">&ldquo;just physics&rdquo;</a>.
</p>`
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
This implementation defines six energy functions. Some are plain potential energy functions, that is, functions of vertex positions <span class="code">E(pos)</span>. Actuation mechanisms are modeled with an action-dependent energy function <span class="code">E(pos, a)</span>. Other energy functions may also depend on the previous state, given by vertex positions and velocities <span class="code">(pos0, vel0)</span>.
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