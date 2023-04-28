#!/bin/bash
clang=${LLVM_BIN_DIR}/clang++
llc=${LLVM_BIN_DIR}/llc
ld=${LLVM_BIN_DIR}/wasm-ld
opt=${LLVM_BIN_DIR}/opt

src_filename="csrc/main.cpp"
lib_name="algovivo"
build_dirname=build

ll_filename="${lib_name}.out.ll"
ll_diff_filename="${lib_name}.diff.out.ll"
ll_diff_opt_filename="${lib_name}.diff.opt.out.ll"
o_filename="${lib_name}.out.o"
wasm_filename=${build_dirname}/algovivo.wasm

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