export default {
  title: "reshaping the energy landscape",
  dark: false,
  content: `<p>
Actions do not move vertices directly. Each muscle has a rest length, and its control signal <span class="code2">a</span> scales that rest length. This defines the length at which the muscle's energy is minimized, but the muscle does not necessarily reach it. A contracting muscle may conflict with a triangle trying to preserve its shape to minimize its elastic potential energy or a vertex trying to fall to minimize its gravitational energy, so the system finds a compromise at a local minimum of the total energy, accounting for contributions from all energy terms.
</p>
<div class="actuation-demo"></div>
<p>
A controller chooses muscle control signals over time to achieve a goal, such as locomotion. It could be obtained through <a class="a2" href="https://www.youtube.com/watch?v=J36M0HfxWYg">reinforcement learning</a>, through <a class="a2" href="https://arxiv.org/abs/2102.05791">differentiable simulation</a>, or by any other method, but that is beside the point. Before any talk of learning or differentiable simulation, the key idea here is that the system naturally settles into configurations defined by energy minimization. Rather than thinking of a controller as something that applies forces or runs some explicit update rule, it is more useful to think of it as something that reshapes the energy landscape that determines those configurations.
This framing is useful not just for motor control, but also for processes like <a class="a2" href="https://x.com/junior_rojas_d/status/2108056995739943244">morphogenesis</a>.
</p>`
};
