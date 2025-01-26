def indent(s):
    return "\n".join("  " + line for line in s.split("\n"))

class Neohookean:
    def __init__(self, simplex_order, simplex_name_singular, simplex_name_plural=None):
        self.simplex_order = simplex_order
        self.simplex_name_singular = simplex_name_singular
        if simplex_name_plural is None:
            simplex_name_plural = f"{simplex_name_singular}s"
        self.simplex_name_plural = simplex_name_plural

    def codegen_accumulate_simplices_energy(self):
        simplex_order = self.simplex_order
        simplex_name_singular = self.simplex_name_singular
        simplex_name_plural = self.simplex_name_plural

        rsi_numel = (simplex_order - 1) ** 2

        get_indices = f"const auto offset = i * {simplex_order};\n"
        for i in range(simplex_order):
            get_indices += f"const auto i{i + 1} = {simplex_name_plural}[offset + {i}];\n"

        args_call_indices = ", ".join(f"i{i + 1}" for i in range(simplex_order))

        get_rsi = f"const auto rsi_offset = {rsi_numel} * i;\n"
        for i in range(simplex_order - 1):
            for j in range(simplex_order - 1):
                get_rsi += f"const auto rsi{i}{j} = rsi[rsi_offset + {i * (simplex_order - 1) + j}];\n"

        args_call_rsi = ""
        for i in range(simplex_order - 1):
            for j in range(simplex_order - 1):
                args_call_rsi += f"rsi{i}{j}, "
            args_call_rsi += "\n"
        
        src = f"for (int i = 0; i < num_{simplex_name_plural}; i++) {{"
        src += f"""
{indent(get_indices)}
{indent(get_rsi)}

  accumulate_{simplex_name_singular}_energy(
    potential_energy,
    pos,
    {args_call_indices},

{indent(indent(args_call_rsi))}
    1,
    mu[i], lambda[i]
  );
}}"""
        return src