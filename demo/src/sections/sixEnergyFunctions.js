export default {
  title: "six energy functions",
  dark: true,
  content: `<p>
This implementation defines six energy functions. Some are plain potential energy functions; that is, functions of vertex positions <span class="code">E(pos)</span>. Actuation mechanisms are modeled with an action-dependent energy function <span class="code">E(pos, a)</span>. Other energy functions may also depend on the previous state, given by vertex positions and velocities <span class="code">(pos0, vel0)</span>.
</p>

<ul>
<li>
  <a href="https://github.com/juniorrojas/algovivo/blob/main/codegen/algovivo_codegen/csrc/potentials/gravity.h">gravity</a>
  <span class="code">E(pos)</span>
</li>
<li>
  <a href="https://github.com/juniorrojas/algovivo/blob/main/codegen/algovivo_codegen/csrc/potentials/collision.h">collision</a>
  <span class="code">E(pos)</span>
</li>
<li>
  <a href="https://github.com/juniorrojas/algovivo/blob/main/codegen/algovivo_codegen/csrc/potentials/muscles.h">muscles</a>
  <span class="code">E(pos, a)</span>
</li>
<li>
  <a href="https://github.com/juniorrojas/algovivo/blob/main/codegen/algovivo_codegen/csrc/potentials/triangles.h">triangles</a>
  <span class="code">E(pos)</span>
</li>
<li>
  <a href="https://github.com/juniorrojas/algovivo/blob/main/codegen/algovivo_codegen/csrc/potentials/friction.h">friction</a>
  <span class="code">E(pos, pos0)</span>
</li>
<li>
  <a href="https://github.com/juniorrojas/algovivo/blob/main/codegen/algovivo_codegen/csrc/dynamics/inertia.h">inertia</a>
  <span class="code">E(pos, pos0, vel0)</span>
</li>
</ul>`
};
