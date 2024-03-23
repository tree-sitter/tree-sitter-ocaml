/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar(require('../ocaml/grammar'), {
  name: 'ocaml_type',

  rules: {
    type: $ => $._type
  }
})

// Make 'type' the first rule
module.exports.grammar.rules = Object.assign(
  {type: null},
  module.exports.grammar.rules
)
