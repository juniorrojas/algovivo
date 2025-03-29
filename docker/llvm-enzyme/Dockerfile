FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
    llvm-11 clang-11 lld-11 \
    ninja-build build-essential cmake \
    git \
    zlib1g-dev && \
    rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/EnzymeAD/Enzyme.git /Enzyme && \
    cd /Enzyme && \
    git checkout 86197cb2d776d72e2063695be21b729f6cffeb9b

RUN cd /Enzyme/enzyme && \
    mkdir build && \
    cd build && \
    cmake -G Ninja .. -DLLVM_DIR=/usr/lib/llvm-11/ && \
    ninja

ENV ENZYME=/Enzyme/enzyme/build/Enzyme/LLVMEnzyme-11.so
ENV LLVM_BIN_DIR=/usr/lib/llvm-11/bin