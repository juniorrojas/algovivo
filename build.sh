#!/bin/bash
clang=${LLVM_BIN_DIR}/clang++
llc=${LLVM_BIN_DIR}/llc
ld=${LLVM_BIN_DIR}/wasm-ld
opt=${LLVM_BIN_DIR}/opt

lib_name="algovivo"

this_dirname=$(dirname "$0")
src_filename="${this_dirname}/csrc/main.cpp"
build_dirname="${this_dirname}/build"

ll_filename="${build_dirname}/${lib_name}.out.ll"
ll_diff_filename="${build_dirname}/${lib_name}.diff.out.ll"
ll_diff_opt_filename="${build_dirname}/${lib_name}.diff.opt.out.ll"
o_filename="${build_dirname}/${lib_name}.out.o"
wasm_filename="${build_dirname}/${lib_name}.wasm"

mkdir -p ${build_dirname}

echo "compiling C++ to LLVM IR..." && \
$clang --target=wasm32 -emit-llvm -c -S ${src_filename} -o ${ll_filename} && \
echo "differentiating LLVM IR..." && \
$opt ${ll_filename} -load=$ENZYME -enzyme -S -o ${ll_diff_filename} && \
echo "optimizing differentiated LLVM IR..." && \
$opt ${ll_diff_filename} -S -o ${ll_diff_opt_filename} && \
echo "compiling LLVM IR to WASM..." && \
$llc -march=wasm32 -filetype=obj -o ${o_filename} ${ll_diff_opt_filename} && \
$ld --no-entry -allow-undefined --export-all -o ${wasm_filename} ${o_filename} && \
echo "saved to ${wasm_filename}"