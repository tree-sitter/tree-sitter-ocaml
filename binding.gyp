{
  "targets": [
    {
      "target_name": "tree_sitter_ocaml_binding",
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "include"
      ],
      "sources": [
        "grammars/ocaml/src/parser.c",
        "grammars/ocaml/src/scanner.c",
        "grammars/interface/src/parser.c",
        "grammars/interface/src/scanner.c",
        "bindings/node/binding.cc"
      ],
      "cflags_c": [
        "-std=c99",
      ]
    },
  ]
}
