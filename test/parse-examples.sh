#!/bin/bash

set -ef

git submodule update --init --depth 1

inclusions=()
exclusions=()

add_pattern() {
  pattern=$1
  first=$2

  if [[ "$pattern" == !* ]]; then
    exclusions+=("!" "-path" "${pattern:1}")
  elif [[ "$first" == true ]]; then
    inclusions+=("-path" $pattern)
  else
    inclusions+=("-o" "-path" $pattern)
  fi
}

first=true
while read pattern; do
  add_pattern $pattern $first
  first=false
done < test/files.txt

while read pattern; do
  exclusions+=("!" "-path" "$pattern")
done < test/invalid-files.txt

tree-sitter parse -q -s --paths <(find examples -type f \( "${inclusions[@]}" \) "${exclusions[@]}")
