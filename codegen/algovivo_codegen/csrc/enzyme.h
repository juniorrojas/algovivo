#pragma once

int enzyme_dup;
int enzyme_out;
int enzyme_const;

template<typename Output, typename... ForwardArgs, typename... BackwardArgs>
Output __enzyme_autodiff(Output (*)(ForwardArgs...), BackwardArgs...);