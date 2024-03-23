/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar(require('../ocaml/grammar'), {
  name: 'ocaml_interface',

  rules: {
    compilation_unit: $ => optional($._signature)
  }
})
