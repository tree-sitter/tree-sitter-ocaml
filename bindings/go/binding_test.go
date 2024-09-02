package tree_sitter_ocaml_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_ocaml "github.com/tree-sitter/tree-sitter-ocaml/bindings/go"
)

func TestOCamlGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_ocaml.LanguageOCaml())
	if language == nil {
		t.Errorf("Error loading OCaml grammar")
	}

	sourceCode := []byte("module M = struct let x = 0 end")
	parser := tree_sitter.NewParser()
	defer parser.Close()
	parser.SetLanguage(language)

	tree := parser.Parse(sourceCode, nil)
	if tree == nil || tree.RootNode().HasError() {
		t.Errorf("Error parsing OCaml")
	}
}

func TestOCamlInterfaceGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_ocaml.LanguageOCamlInterface())
	if language == nil {
		t.Errorf("Error loading OCamlInterface grammar")
	}

	sourceCode := []byte("module M : sig val x : int end")
	parser := tree_sitter.NewParser()
	defer parser.Close()
	parser.SetLanguage(language)

	tree := parser.Parse(sourceCode, nil)
	if tree == nil || tree.RootNode().HasError() {
		t.Errorf("Error parsing OCamlInterface")
	}
}

func TestOCamlTypeGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_ocaml.LanguageOCamlType())
	if language == nil {
		t.Errorf("Error loading OCamlType grammar")
	}

	sourceCode := []byte("int list")
	parser := tree_sitter.NewParser()
	defer parser.Close()
	parser.SetLanguage(language)

	tree := parser.Parse(sourceCode, nil)
	if tree == nil || tree.RootNode().HasError() {
		t.Errorf("Error parsing OCamlType")
	}
}
