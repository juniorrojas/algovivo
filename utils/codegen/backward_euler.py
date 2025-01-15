import codegen

def indent(s):
    return "\n".join("  " + line for line in s.split("\n"))

class BackwardEuler:
    def __init__(self):
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

        self.loss_body = backward_euler_loss_body