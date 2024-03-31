FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
    llvm-11 clang-11 lld-11 \
    ninja-build build-essential cmake \
    git \
    zlib1g-dev && \
    rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/EnzymeAD/Enzyme.git /Enzyme

RUN cd /Enzyme/enzyme && \
    mkdir build && \
    cd build && \
    cmake -G Ninja .. -DLLVM_DIR=/usr/lib/llvm-11/ && \
    ninja
