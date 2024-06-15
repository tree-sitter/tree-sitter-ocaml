package tree_sitter_ocaml

// #cgo CFLAGS: -I../../grammars/type/src -std=c11 -fPIC
// #include "../../grammars/type/src/parser.c"
// #include "../../grammars/type/src/scanner.c"
import "C"

import "unsafe"

// Get the tree-sitter Language for OCaml types.
func OCamlType() unsafe.Pointer {
	return unsafe.Pointer(C.tree_sitter_ocaml_type())
}
