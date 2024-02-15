# tree-sitter-ocaml

[![CI][ci]](https://github.com/tree-sitter/tree-sitter-ocaml/actions/workflows/ci.yml)
[![discord][discord]](https://discord.gg/w7nTvsVJhm)
[![matrix][matrix]](https://matrix.to/#/#tree-sitter-chat:matrix.org)
[![crates][crates]](https://crates.io/crates/tree-sitter-ocaml)
[![npm][npm]](https://www.npmjs.com/package/tree-sitter-ocaml)

OCaml grammar for [tree-sitter](https://github.com/tree-sitter/tree-sitter).

This module defines two grammars for implementation (`.ml`) and interface (`.mli`) files. Require them as follows:

```js
require('tree-sitter-ocaml').ocaml;
require('tree-sitter-ocaml').interface;
```

References

- [OCaml language reference](https://ocaml.org/manual/language.html)
- [OCaml language extensions](https://ocaml.org/manual/extn.html)
- [OCaml parser](https://github.com/ocaml/ocaml/blob/trunk/parsing/parser.mly)

[ci]: https://img.shields.io/github/actions/workflow/status/tree-sitter/tree-sitter-ocaml/ci.yml?logo=github&label=CI
[discord]: https://img.shields.io/discord/1063097320771698699?logo=discord&label=discord
[matrix]: https://img.shields.io/matrix/tree-sitter-chat%3Amatrix.org?logo=matrix&label=matrix
[npm]: https://img.shields.io/npm/v/tree-sitter-ocaml?logo=npm
[crates]: https://img.shields.io/crates/v/tree-sitter-ocaml?logo=rust
