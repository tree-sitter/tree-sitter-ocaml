from typing import Final
from typing_extensions import CapsuleType


HIGHLIGHTS_QUERY: Final[str]
"""The syntax highlighting query for OCaml."""

LOCALS_QUERY: Final[str]
"""The local variable query for OCaml."""

TAGS_QUERY: Final[str]
"""The symbol tagging query for OCaml."""


def language_ocaml() -> CapsuleType:
    """The tree-sitter language function for OCaml."""


def language_ocaml_interface() -> CapsuleType:
    """The tree-sitter language function for OCaml interfaces."""


def language_ocaml_type() -> CapsuleType:
    """The tree-sitter language function for OCaml types."""
