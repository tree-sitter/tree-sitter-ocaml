module.exports = grammar(require('../ml/grammar'), {
  name: 'mli',

  rules: {
    compilation_unit: $ => optional($._signature)
  }
})
