#!/bin/bash
set -e

clang=${LLVM_BIN_DIR}/clang++
opt=${LLVM_BIN_DIR}/opt

lib_name="algovivo"

this_dirname=$(dirname "$0")
src_filename="${this_dirname}/csrc/main.cpp"
build_dirname="${this_dirname}/build"

ll_filename="${build_dirname}/${lib_name}.out.ll"
ll_diff_filename="${build_dirname}/${lib_name}.diff.out.ll"
ll_diff_opt_filename="${build_dirname}/${lib_name}.diff.opt.out.ll"

mkdir -p ${build_dirname}

echo "NATIVE environment variable: ${NATIVE}"
build_native=${NATIVE:-false}
echo "build_native variable: $build_native"

echo "compiling C++ to LLVM IR..."
if [ "$build_native" = "true" ]; then
  echo "Building native library (.so)"
  $clang -emit-llvm -c -S ${src_filename} -o ${ll_filename}
else
  $clang --target=wasm32 -emit-llvm -c -S ${src_filename} -o ${ll_filename}
fi

echo "differentiating LLVM IR..."

llvm_version=$($opt --version | grep -oP 'version \K[0-9]+' | head -1)
echo "detected LLVM version: ${llvm_version}"

if [ "$llvm_version" -ge 14 ]; then
  echo "using -load-pass-plugin"
  $opt ${ll_filename} -load-pass-plugin=$ENZYME -passes=enzyme -S -o ${ll_diff_filename}
else
  echo "using -load (legacy)"
  $opt ${ll_filename} -load=$ENZYME -enzyme -S -o ${ll_diff_filename}
fi

echo "optimizing differentiated LLVM IR..."
$opt ${ll_diff_filename} -S -o ${ll_diff_opt_filename}

if [ "$build_native" = "true" ]; then
    so_filename="${build_dirname}/${lib_name}.so"

    echo "compiling LLVM IR to native library..."
    $clang -shared -o ${so_filename} ${ll_diff_opt_filename}
    echo "saved to ${so_filename}"
else
    echo "compiling LLVM IR to WASM..."

    llc=${LLVM_BIN_DIR}/llc
    ld=${LLVM_BIN_DIR}/wasm-ld
    o_filename="${build_dirname}/${lib_name}.out.o"
    wasm_filename="${build_dirname}/${lib_name}.wasm"

    $llc -march=wasm32 -filetype=obj -o ${o_filename} ${ll_diff_opt_filename}
    $ld --no-entry -allow-undefined --export-all -o ${wasm_filename} ${o_filename}
    echo "saved to ${wasm_filename}"
fi