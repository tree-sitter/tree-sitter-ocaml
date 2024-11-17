# tree-sitter-ocaml

[![CI][ci]](https://github.com/tree-sitter/tree-sitter-ocaml/actions/workflows/ci.yml)
[![pypi][pypi]](https://pypi.org/project/tree-sitter-ocaml/)

This module provides OCaml grammars for the [tree-sitter][] parsing library.
There are separate grammars for implementations (`.ml`), interfaces (`.mli`)
and types.

## Installation

```sh
pip install tree-sitter-ocaml
```

You will probably also need the [tree-sitter binding][tree-sitter binding].

```sh
pip install tree-sitter
```

## Usage

Load the grammar as a `Language` object:

```python
import tree_sitter_ocaml
from tree_sitter import Language, Parser

language_ocaml = Language(tree_sitter_ocaml.language_ocaml())
```

Create a `Parser` and configure it to use the language:

```python
parser = Parser(language_ocaml)
```

Parse some source code:

```python
tree = parser.parse(
    b"""
    module M : sig
      val x : int
    end
    """
)
```

Use `language_ocaml_interface()` to parse interface files (with `.mli` extension)
and `language_ocaml_type()` to parse type signatures.

[ci]: https://img.shields.io/github/actions/workflow/status/tree-sitter/tree-sitter-ocaml/ci.yml?logo=github&label=CI
[pypi]: https://img.shields.io/pypi/v/tree-sitter-ocaml?logo=pypi&logoColor=white&label=PyPI
[tree-sitter]: https://tree-sitter.github.io/tree-sitter/
[tree-sitter binding]: https://pypi.org/project/tree-sitter/
