export default {
  title: "no differential equations, just energy minimization",
  dark: false,
  content: `<p>
This implementation uses the backward Euler method, which is conventionally presented as an implicit <a class="a2" href="https://github.com/juniorrojas/springs-integration-pytorch">numerical integration</a> method, derived as a numerical solution to a differential equation like f = ma (Newtonian mechanics).
However, what we actually implement in practice to solve the resulting non-linear root finding problem in a reliable manner is a gradient-based optimization method that finds a local minimum of a function that consists of the sum of the six energy functions mentioned before:
</p>

<span class="code2" style="white-space: normal">pos1 = argmin((pos) => E(pos, pos0, vel0, a))</span>

<p>
The velocity is then updated with a simple update rule:
</p>

<span class="code2">vel1 = (pos1 - pos0) / h</span>

<p>
Many other implicit numerical integration methods share a similar form, where the next state is found by minimizing an energy function.
While the inertial energy term and velocity update rule may vary depending on the specific method used, energy minimization remains central to explaining state transitions.
Instead of viewing these methods as numerical solutions to differential equations, we can view them as energy-based models that capture Newton's first law of motion in an inertial energy term.
</p>`
};
