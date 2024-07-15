from unittest import TestCase

import tree_sitter_ocaml
from tree_sitter import Language, Parser


class TestLanguage(TestCase):
    def test_ocaml_grammar(self):
        language = Language(tree_sitter_ocaml.ocaml())
        parser = Parser(language)
        tree = parser.parse(
            b"""
            module M = struct
              let x = 0
            end
            """
        )
        self.assertFalse(tree.root_node.has_error)

    def test_interface_grammar(self):
        language = Language(tree_sitter_ocaml.interface())
        parser = Parser(language)
        tree = parser.parse(
            b"""
            module M : sig
              val x : int
            end
            """
        )
        self.assertFalse(tree.root_node.has_error)

    def test_type_grammar(self):
        language = Language(tree_sitter_ocaml.type())
        parser = Parser(language)
        tree = parser.parse(b"int list")
        self.assertFalse(tree.root_node.has_error)
