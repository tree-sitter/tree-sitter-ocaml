{
  "targets": [
    {
      "target_name": "tree_sitter_ocaml_binding",
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "include",
      ],
      "sources": [
        "interface/src/parser.c",
        "interface/src/scanner.cc",
        "ocaml/src/parser.c",
        "ocaml/src/scanner.cc",
        "bindings/node/binding.cc",
      ],
      "cflags_c": [
        "-std=c99",
      ]
    },
  ]
}
