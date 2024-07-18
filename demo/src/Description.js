class Section {
  constructor(title, content) {
    this.domElement = document.createElement("div");
    this.domElement.style.textAlign = "left";
    this.domElement.style.color = "#666";
    this.domElement.style.fontSize = "14px";
    this.domElement.style.padding = "22px";
    this.domElement.style.paddingRight = "26px";
    this.domElement.style.paddingLeft = "26px";
    this.domElement.style.width = "100%";
    
    const h2 = document.createElement("h2");
    this.header = h2;
    h2.style.color = "black";
    h2.style.fontSize = "25px";
    h2.style.padding = "10px";
    h2.style.borderBottom = "2px solid black";
    h2.textContent = title;

    const contentElement = document.createElement("div");
    contentElement.innerHTML = content;

    this.domElement.innerHTML = "";
    this.domElement.appendChild(h2);
    this.domElement.appendChild(contentElement);
  }

  setStyle1() {
    this.domElement.style.backgroundColor = "black";
    this.domElement.style.color = "rgb(199, 199, 199)";
    this.header.style.color = "white";
    this.header.style.borderBottom = "2px solid white";
  }
}

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

    let s = new Section(
      "energy-based models for virtual creatures",
`<p>
The concept of energy minimization is useful to understand physical systems as goal-directed systems.
A deformable object that tends to recover its rest shape can be understood as a system whose goal is to minimize its elastic potential energy.
More generally, energy can refer to any scalar-valued function that measures compatibility between variables as a means of implicitly capturing their dependencies through energy minimization.
This more general notion of energy is useful to model inertia, friction, actuation mechanisms and, potentially, many other goal-directed behaviors that may or may not be be conventionally considered "just physics".
</p>`
    );
    s.setStyle1();
    this.domElement.appendChild(s.domElement);

    s = new Section(
      "no forces, just energy functions",
`<p>
Much like the loss function encapsulates the objective of a neural network in a single scalar value, potential energy functions offer a scalar representation of the objective of a physical system.
In practice, just as we typically do not compute neural network gradients by hand, we can also avoid computing forces by hand.
The force can be straightforwardly derived as the negative gradient of the potential energy.
For energy functions that are not plain potential energy functions, the negative gradient cannot be directly interpreted as a force, but it can still be used for gradient-based optimization is especially useful for implicit numerical integration methods.
</p>`);
    this.domElement.appendChild(s.domElement);

    s = new Section(
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
    this.domElement.appendChild(s.domElement);
  }
}