export default {
  title: "no Lagrangians, no Hamiltonians, just energy",
  dark: true,
  content: `<p>
Recall that in this context &ldquo;energy&rdquo; is any <a href="https://youtu.be/MiqLoAZFRSE?t=2177">scalar-valued function that measures incompatibility between variables</a>.
When we say inertial energy, we do not mean kinetic energy.
When we say energy minimization, we do not mean Hamiltonian minimization.
It is actually possible to implement <a href="https://github.com/juniorrojas/springs-integration-pytorch?tab=readme-ov-file#total-energy-hamiltonian-conservation">Hamiltonian-preserving methods</a> by &ldquo;energy&rdquo; minimization.
Energy-based models can also easily describe dissipative systems.
<a href="https://www.youtube.com/watch?v=7fRfxiyTKS0">Lagrangians and Hamiltonians cannot really describe dissipative systems</a>.
When we say energy minimization, we mean something akin to the principle of least action, except that &ldquo;action&rdquo; has a very specific definition in Lagrangian mechanics, and we are not using that definition here.
We also want to reserve the word &ldquo;action&rdquo; to refer to actuation mechanisms, such as muscle control, which are modeled as action-dependent energy functions.
Whatever variable or function names you prefer to use in your code, the important thing is to have a <a href="https://github.com/juniorrojas/algovivo">working implementation</a> that goes beyond just words and mathematical formulas that may not even be computable.
</p>`
};
