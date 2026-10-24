export default {
  title: "no forces, just energy functions",
  dark: false,
  content: `<p>
Much like the loss function encapsulates in a single scalar value the objective of a neural network during training, potential energy functions offer a scalar representation of the objective of a mechanical system in a dissipative process.
In practice, just as we typically do not compute neural network gradients by hand, we can also avoid computing forces by hand if we use automatic differentiation.
The force is just the negative gradient of the potential energy.
For more general energy functions, which extend beyond potential energy, the negative gradient might not directly represent a force, but it is useful for gradient-based optimization.
</p>`
};
