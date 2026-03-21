/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

import ocaml from '../ocaml/grammar';

export default grammar(ocaml, {
  name: 'ocaml_type',

  rules: {
    type: $ => $._type,
  },
});

// Make 'type' the first rule
module.exports.grammar.rules = Object.assign(
  {type: null},
  module.exports.grammar.rules,
);
