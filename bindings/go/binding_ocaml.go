package tree_sitter_ocaml

// #cgo CFLAGS: -I../../grammars/ocaml/src -std=c11 -fPIC
// #include "../../grammars/ocaml/src/parser.c"
// #include "../../grammars/ocaml/src/scanner.c"
import "C"

import "unsafe"

// Get the tree-sitter Language for OCaml.
func OCaml() unsafe.Pointer {
	return unsafe.Pointer(C.tree_sitter_ocaml())
}
