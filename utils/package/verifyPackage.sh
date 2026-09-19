#!/usr/bin/env bash
set -e

pkg_spec="$1"
this_dirname=$(cd "$(dirname "$0")" && pwd)

workdir=$(mktemp -d)
cd "$workdir"
npm init -y > /dev/null
npm pkg set type=module
npm install "$pkg_spec"

# run from here so import.meta.resolve anchors at the install, not the repo
cp "${this_dirname}/verifyPackage.js" .
node verifyPackage.js
