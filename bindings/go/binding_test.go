package tree_sitter_ocaml_test

import (
	"context"
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	tree_sitter_ocaml "github.com/tree-sitter/tree-sitter-ocaml"
)

func TestOCamlGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_ocaml.OCaml())
	if language == nil {
		t.Errorf("Error loading OCaml grammar")
	}

	sourceCode := []byte("module M = struct let x = 0 end")

	node, err := tree_sitter.ParseCtx(context.Background(), sourceCode, language)
	if err != nil || node.HasError() {
		t.Errorf("Error parsing OCaml")
	}
}

func TestOCamlInterfaceGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_ocaml.OCamlInterface())
	if language == nil {
		t.Errorf("Error loading OCamlInterface grammar")
	}

	sourceCode := []byte("module M : sig val x : int end")

	node, err := tree_sitter.ParseCtx(context.Background(), sourceCode, language)
	if err != nil || node.HasError() {
		t.Errorf("Error parsing OCamlInterface")
	}
}
