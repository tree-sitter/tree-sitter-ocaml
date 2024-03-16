{
  "targets": [
    {
      "target_name": "tree_sitter_ocaml_binding",
      "dependencies": [
        "<!(node -p \"require('node-addon-api').targets\"):node_addon_api_except",
      ],
      "include_dirs": [
        "include"
      ],
      "sources": [
        "bindings/node/binding.cc",
        "grammars/ocaml/src/parser.c",
        "grammars/ocaml/src/scanner.c",
        "grammars/interface/src/parser.c",
        "grammars/interface/src/scanner.c",
      ],
      "cflags_c": [
        "-std=c11",
      ]
    },
  ]
}
