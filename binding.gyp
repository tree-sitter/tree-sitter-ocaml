{
  "targets": [
    {
      "target_name": "tree_sitter_ocaml_binding",
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "ml/src"
      ],
      "sources": [
        "ml/src/parser.c",
        "ml/src/binding.cc",
        "ml/src/scanner.cc"
      ],
      "cflags_c": [
        "-std=c99",
      ]
    },
    {
      "target_name": "tree_sitter_mli_binding",
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "mli/src"
      ],
      "sources": [
        "mli/src/parser.c",
        "mli/src/binding.cc",
        "mli/src/scanner.cc"
      ],
      "cflags_c": [
        "-std=c99",
      ]
    }
  ]
}
