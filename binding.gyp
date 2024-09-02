{
  "targets": [
    {
      "target_name": "tree_sitter_ocaml_binding",
      "dependencies": [
        "<!(node -p \"require('node-addon-api').targets\"):node_addon_api_except",
      ],
      "include_dirs": [
        "grammars/ocaml/src",
      ],
      "sources": [
        "grammars/ocaml/src/parser.c",
        "grammars/ocaml/src/scanner.c",
        "grammars/interface/src/parser.c",
        "grammars/interface/src/scanner.c",
        "grammars/type/src/parser.c",
        "grammars/type/src/scanner.c",
        "bindings/node/binding.cc",
      ],
      "conditions": [
        ["OS!='win'", {
          "cflags_c": [
            "-std=c11",
          ],
        }, { # OS == "win"
          "cflags_c": [
            "/std:c11",
            "/utf-8",
          ],
        }],
      ],
    }
  ]
}
