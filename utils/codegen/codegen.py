from pathlib import Path
import os
this_filepath = Path(os.path.realpath(__file__))
this_dirpath = this_filepath.parent
import codegen

def indent(s):
    return "\n".join("  " + line for line in s.split("\n"))

backward_euler_loss = codegen.Fun("backward_euler_loss")
backward_euler_loss_args = backward_euler_loss.args

backward_euler_loss_args.add_arg("float", "g")
backward_euler_loss_args.add_arg("float", "h")

# vertices
backward_euler_loss_args.add_arg("int", "num_vertices")
backward_euler_loss_args.add_arg("float*", "pos", differentiable=True)
backward_euler_loss_args.add_arg("float*", "pos0")
backward_euler_loss_args.add_arg("float*", "vel0")
backward_euler_loss_args.add_arg("float", "vertex_mass")

# muscles
backward_euler_loss_args.add_arg("int", "num_muscles")
backward_euler_loss_args.add_arg("int*", "muscles")
backward_euler_loss_args.add_arg("float", "k")
backward_euler_loss_args.add_arg("float*", "a")
backward_euler_loss_args.add_arg("float*", "l0")

# triangles
backward_euler_loss_args.add_arg("int", "num_triangles")
backward_euler_loss_args.add_arg("int*", "triangles")
backward_euler_loss_args.add_arg("float*", "rsi")
backward_euler_loss_args.add_arg("float", "mu")
backward_euler_loss_args.add_arg("float", "lambda")

# friction
backward_euler_loss_args.add_arg("float", "k_friction")

backward_euler_loss_grad = backward_euler_loss.make_backward_pass()
backward_euler_loss_grad_args = backward_euler_loss_grad.args

system_attrs = codegen.Args()
for arg in backward_euler_loss_args.args:
    if not arg.differentiable:
        system_attrs.add_arg(arg.t, arg.name)
system_attrs.add_arg("int", "fixed_vertex_id")

update_args = codegen.Args()
for arg in system_attrs.args:
    update_args.add_arg(arg.t, arg.name)

for arg in backward_euler_loss_args.args:
    if arg.differentiable:
        update_args.add_arg(arg.t, f"{arg.name}1", mut=True)
        update_args.add_arg(arg.t, f"{arg.name}_grad", mut=True)
        update_args.add_arg(arg.t, f"{arg.name}_tmp", mut=True)
        if arg.name == "pos":
            update_args.add_arg(arg.t, f"vel1", mut=True)
        else:
            update_args.add_arg(arg.t, f"{arg.name}_v1", mut=True)

backward_euler_loss_body_args = backward_euler_loss_args.codegen_fun_signature()

backward_euler_loss_body = """const auto space_dim = 2;

float inertial_energy = 0.0;
float potential_energy = 0.0;"""

# inertia
backward_euler_loss_body += """
for (int i = 0; i < num_vertices; i++) {
  vec2_get(p, pos, i);
  vec2_get(v, vel0, i);
  vec2_get(p0, pos0, i);
  accumulate_inertial_energy(
    inertial_energy,
    px, py,
    vx, vy,
    p0x, p0y,
    h,
    vertex_mass
  );
}"""

# muscles
backward_euler_loss_body += """
for (int i = 0; i < num_muscles; i++) {
  const auto offset = i * 2;
  const auto i1 = muscles[offset    ];
  const auto i2 = muscles[offset + 1];

  accumulate_muscle_energy(
    potential_energy,
    pos,
    i1, i2,
    a[i], l0[i], k
  );
}"""

# triangles
backward_euler_loss_body += """
for (int i = 0; i < num_triangles; i++) {
  const auto offset = i * 3;
  const auto i1 = triangles[offset    ];
  const auto i2 = triangles[offset + 1];
  const auto i3 = triangles[offset + 2];

  const auto rsi_offset = 4 * i;
  float rsi00 = rsi[rsi_offset    ];
  float rsi01 = rsi[rsi_offset + 1];
  float rsi10 = rsi[rsi_offset + 2];
  float rsi11 = rsi[rsi_offset + 3];

  accumulate_triangle_energy(
    potential_energy,
    pos,
    i1, i2, i3,
    rsi00, rsi01,
    rsi10, rsi11,
    1,
    mu, lambda
  );
}"""

# vertices (gravity, collision, friction)
backward_euler_loss_body += """
for (int i = 0; i < num_vertices; i++) {
  const auto offset = space_dim * i;
  
  const auto px = pos[offset    ];
  const auto py = pos[offset + 1];

  const auto p0x = pos0[offset    ];
  const auto p0y = pos0[offset + 1];

  accumulate_gravity_energy(
    potential_energy,
    py,
    vertex_mass,
    g
  );

  accumulate_collision_energy(
    potential_energy,
    py
  );

  accumulate_friction_energy(
    potential_energy,
    px,
    p0x, p0y,
    h,
    k_friction
  );
}
"""

backward_euler_loss_body += "return 0.5 * inertial_energy + h * h * potential_energy;"

backward_euler_loss_body = indent(backward_euler_loss_body)

enzyme_args_call = backward_euler_loss_args.codegen_enzyme_call()
backward_euler_loss_grad_body = backward_euler_loss_grad.codegen_body()

with open(this_dirpath.joinpath("system.template.h")) as f:
    template = f.read()
    
    src = template
    
    src = (src
        .replace("// {{backward_euler_loss_body}}", backward_euler_loss_body)
        .replace("// {{backward_euler_loss_args}}", backward_euler_loss_body_args)
        .replace("// {{backward_euler_loss_args_call}}", backward_euler_loss_args.codegen_call())
        .replace("// {{backward_euler_loss_grad_args}}", backward_euler_loss_grad_args.codegen_fun_signature())
        .replace("// {{backward_euler_loss_grad_args_call}}", backward_euler_loss_grad_args.codegen_call())
        .replace("// {{backward_euler_loss_grad_body}}", indent(backward_euler_loss_grad_body))
    )

    src = (src
        .replace("// {{system_attrs}}", indent(system_attrs.codegen_struct_attrs()))
        .replace("// {{backward_euler_update_args}}", indent(update_args.codegen_fun_signature()))
        .replace("// {{system_set}}", indent(system_attrs.codegen_struct_set("system")))
        .replace("/* {{system_forward_args}} */", "float* pos")
        .replace("/* {{system_backward_args}} */", "float* pos, float* pos_grad")
    )

output_filepath = this_dirpath.parent.parent.joinpath("csrc", "algovivo", "system.h")
with open(output_filepath, "w") as f:
    f.write(src)
print(f"Saved to {output_filepath}")

with open(this_dirpath.joinpath("backward_euler.template.h")) as f:
    template = f.read()

    src = template.replace(
        "/* {{backward_euler_update_pos_args}} */",
        "float* pos, float* pos_grad, float* pos_tmp"
    )
    src = src.replace(
        "/* {{backward_euler_update_vel_args}} */",
        "float num_vertices, const float* pos0, const float* vel0, float* pos1, float* vel1, float h"
    )
    src = src.replace(
        "/* {{backward_euler_update_args}} */",
        "float* pos1, float* vel1, float* pos_grad, float* pos_tmp"
    )

output_filepath = this_dirpath.parent.parent.joinpath("csrc", "algovivo", "dynamics", "backward_euler.h")
with open(output_filepath, "w") as f:
    f.write(src)
print(f"Saved to {output_filepath}")