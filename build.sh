#!/bin/bash
clang=${llvm_bin_dir}/clang++
llc=${llvm_bin_dir}/llc
ld=${llvm_bin_dir}/wasm-ld
opt=${llvm_bin_dir}/opt

src_filename=csrc/main.cpp
ll_filename=main.out.ll
ll_diff_filename=main.diff.out.ll
ll_diff_opt_filename=main.diff.opt.out.ll
o_filename=main.out.o
wasm_filename=build/algovivo.wasm
mkdir -p build

echo "building wasm..." && \
$clang --target=wasm32 -emit-llvm -c -S ${src_filename} -o ${ll_filename} && \
$opt ${ll_filename} -load=$enzyme -enzyme -S -o ${ll_diff_filename} && \
$opt ${ll_diff_filename} -S -o ${ll_diff_opt_filename} && \
$llc -march=wasm32 -filetype=obj -o ${o_filename} ${ll_diff_opt_filename} && \
$ld --no-entry -allow-undefined --export-all -o ${wasm_filename} ${o_filename} && \
echo "saved to ${wasm_filename}"