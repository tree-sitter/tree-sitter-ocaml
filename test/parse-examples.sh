#!/bin/bash

set -ef

cd "$(dirname "$0")/.."

git submodule update --init --depth 1

tree-sitter parse -q -s \
  $(cat test/files.txt) \
  $(for file in $(cat test/invalid-files.txt); do echo "!${file}"; done)
