const PREC = {
  prefix: 19,
  dot: 18,
  hash: 17,
  app: 16,
  neg: 15,
  pow: 14,
  mult: 13,
  add: 12,
  cons: 11,
  concat: 10,
  rel: 9,
  and: 8,
  or: 7,
  prod: 6,
  assign: 5,
  if: 4,
  seq: 3,
  match: 2
}

const OP_CHAR = /[!$%&*+\-./:<=>?@^|~]/
const NUMBER = token(choice(
  /[0-9][0-9_]*(\.[0-9_]*)?([eE][+\-]?[0-9][0-9_]*)?[g-zG-Z]?/,
  /0[xX][0-9A-Fa-f][0-9A-Fa-f_]*(\.[0-9A-Fa-f_]*)?([pP][+\-]?[0-9][0-9_]*)?[g-zG-Z]?/,
  /0[oO][0-7][0-7_]*[g-zG-Z]?/,
  /0[bB][01][01_]*[g-zG-Z]?/
))

const field = (_name, value) => value

module.exports = grammar({
  name: 'ocaml',

  extras: $ => [
    /\s/,
    $.comment,
    $.line_number_directive,
    $.attribute
  ],

  inline: $ => [
    $._module_item_ext,
    $._module_type_ext,
    $._simple_module_expression_ext,
    $._module_expression_ext,
    $._simple_class_type_ext,
    $._class_type_ext,
    $._class_field_specification_ext,
    $._class_expression_ext,
    $._class_field_ext,
    $._simple_type_ext,
    $._tuple_type_ext,
    $._type_ext,
    $._tag_spec,
    $._simple_expression_ext,
    $._expression_ext,
    $._sequence_expression_ext,
    $._simple_pattern_ext,
    $._pattern_ext,
    $._pattern_no_exn_ext,
    $._label_name,
    $._field_name,
    $._class_name,
    $._method_name,
    $._type_constructor,
    $._instance_variable_name,
    $._module_name,
    $._module_type_name,
    $._constructor_name,
  ],

  word: $ => $._identifier,

  supertypes: $ => [
    $._module_item,
    $._parameter,
    $._module_type,
    $._simple_module_expression,
    $._module_expression,
    $._simple_class_type,
    $._class_type,
    $._class_field_specification,
    $._simple_class_expression,
    $._class_expression,
    $._class_field,
    $._polymorphic_type,
    $._simple_type,
    $._tuple_type,
    $._tag_spec,
    $._type,
    $._simple_expression,
    $._expression,
    $._sequence_expression,
    $._simple_pattern,
    $._pattern,
    $._pattern_no_exn,
    $._extension,
    $._item_extension,
    $._constant,
    $._signed_constant
  ],

  rules: {
    compilation_unit: $ => seq(
      optional($.shebang),
      optional($._definitions)
    ),

    shebang: $ => /#!.*/,

    _definitions: $ => choice(
      repeat1(';;'),
      seq(
        repeat(';;'),
        choice(
          field('item', $._module_item_ext),
          field('directive', $.toplevel_directive),
          field('item', $.expression_item)
        ),
        repeat(choice(
          seq(
            repeat(';;'),
            choice(
              field('item', $._module_item_ext),
              field('directive', $.toplevel_directive)
            )
          ),
          seq(
            repeat1(';;'),
            field('item', $.expression_item)
          )
        )),
        repeat(';;')
      )
    ),

    expression_item: $ => seq(
      field('expression', $._sequence_expression_ext),
      repeat(field('item_attribute', $.item_attribute))
    ),

    _specifications: $ => choice(
      repeat1(';;'),
      seq(
        repeat1(seq(repeat(';;'), field('item', $._module_item_ext))),
        repeat(';;')
      )
    ),

    // Toplevel

    toplevel_directive: $ => seq(
      field('name', $.directive),
      optional(field('payload', choice(
        $._constant,
        $.value_path,
        $._simple_module_expression_ext
      )))
    ),

    // Module items

    _module_item: $ => choice(
      $.value_specification,
      $.value_definition,
      $.external,
      $.type_definition,
      $.exception_definition,
      $.module_definition,
      $.module_type_definition,
      $.open_statement,
      $.include_statement,
      $.class_definition,
      $.class_type_definition,
      $.floating_attribute
    ),

    _module_item_ext: $ => choice(
      $._module_item,
      $._item_extension
    ),

    value_specification: $ => seq(
      'val',
      optional($._attribute),
      field('name', $.value_name),
      ':',
      field('type', $._type_ext),
      repeat(field('item_attribute', $.item_attribute))
    ),

    value_definition: $ => seq(
      choice(
        seq('let', optional($._attribute), optional('rec')),
        field('let', $.let_operator)
      ),
      sep1(
        choice(
          'and',
          field('and', $.and_operator)
        ),
        field('binding', $.let_binding)
      )
    ),

    let_binding: $ => seq(
      field('name', $._pattern_no_exn_ext),
      repeat(field('parameter', $._parameter)),
      optional(seq(':', field('type', $._polymorphic_type))),
      optional(seq(':>', field('coercion', $._type_ext))),
      '=',
      field('body', $._sequence_expression_ext),
      repeat(field('item_attribute', $.item_attribute))
    ),

    _parameter: $ => choice(
      $.parameter,
      alias($._parenthesized_abstract_type, $.abstract_type)
    ),

    parameter: $ => choice(
      field('name', $._simple_pattern_ext),
      field('label', $.label),
      seq(
        field('label', $.label),
        token.immediate(':'),
        field('name', $._simple_pattern_ext)
      ),
      seq(
        choice('~', '?'),
        '(',
        field('label', $._label_name),
        optional(seq(':', field('type', $._type_ext))),
        optional(seq('=', field('default', $._sequence_expression_ext))),
        ')'
      ),
      seq(
        field('label', $.label),
        token.immediate(':'),
        '(',
        field('name', $._pattern_ext),
        optional(seq(':', field('type', $._type_ext))),
        seq('=', field('label', $._sequence_expression_ext)),
        ')'
      )
    ),

    external: $ => seq(
      'external',
      optional($._attribute),
      field('name', $.value_name),
      ':',
      field('type', $._type_ext),
      '=',
      repeat1(field('declaration', $.string)),
      repeat(field('item_attribute', $.item_attribute))
    ),

    type_definition: $ => seq(
      'type',
      optional($._attribute),
      optional('nonrec'),
      sep1(
        'and',
        field('binding', $.type_binding)
      )
    ),

    type_binding: $ => seq(
      optional(field('params', $.type_params)),
      choice(
        seq(
          field('name', $._type_constructor),
          optional($._type_equation),
          optional(seq(
            '=',
            optional('private'),
            field('body', choice(
              $.variant_declaration,
              $.record_declaration,
              '..'
            ))
          )),
          repeat(field('constraint', $.type_constraint))
        ),
        seq(
          field('name', $.type_constructor_path),
          seq(
            '+=',
            optional('private'),
            field('body', $.variant_declaration),
          )
        )
      ),
      repeat(field('item_attribute', $.item_attribute))
    ),

    type_params: $ => choice(
      $._type_param,
      parenthesize(sep1(',', $._type_param))
    ),

    _type_param: $ => seq(
      optional(choice('+', '-')),
      field('name', choice(
        $.type_variable,
        alias('_', $.type_variable)
      ))
    ),

    _type_equation: $ => seq(
      choice('=', ':='),
      optional('private'),
      field('type', $._type_ext)
    ),

    variant_declaration: $ => choice(
      seq('|', sep('|', field('constructor', $.constructor_declaration))),
      sep1('|', field('constructor', $.constructor_declaration))
    ),

    constructor_declaration: $ => seq(
      field('name', choice(
        $._constructor_name,
        seq('[', ']'),
        seq('(', ')'),
        'true',
        'false'
      )),
      optional(choice(
        seq('of', field('argument', $.constructor_argument)),
        seq(':', field('type', $._simple_type_ext)),
        seq(':', field('argument', $.constructor_argument), '->', field('type', $._simple_type_ext)),
        seq('=', field('equation', $.constructor_path))
      ))
    ),

    constructor_argument: $ => choice(
      sep1('*', field('type', $._simple_type_ext)),
      field('record', $.record_declaration)
    ),

    record_declaration: $ => seq(
      '{',
      sep1(';', field('field', $.field_declaration)),
      optional(';'),
      '}'
    ),

    field_declaration: $ => seq(
      optional('mutable'),
      field('name', $._field_name),
      ':',
      field('type', $._polymorphic_type),
    ),

    type_constraint: $ => seq(
      'constraint',
      field('left', $._type_ext),
      '=',
      field('right', $._type_ext)
    ),

    exception_definition: $ => seq(
      'exception',
      optional($._attribute),
      field('constructor', $.constructor_declaration),
      repeat(field('item_attribute', $.item_attribute))
    ),

    module_definition: $ => seq(
      'module', optional($._attribute), optional('rec'),
      sep1('and', field('binding', $.module_binding))
    ),

    module_binding: $ => seq(
      field('name', choice($._module_name, alias('_', $.module_name))),
      repeat(field('parameter', $.module_parameter)),
      optional(seq(':', field('type', $._module_type_ext))),
      optional(seq('=', field('body', $._simple_module_expression_ext))),
      repeat(field('item_attribute', $.item_attribute))
    ),

    module_parameter: $ => parenthesize(optional(seq(
      field('name', choice($._module_name, alias('_', $.module_name))),
      ':',
      field('type', $._module_type_ext)
    ))),

    module_type_definition: $ => seq(
      'module', 'type',
      optional($._attribute),
      field('name', $._module_type_name),
      optional(seq('=', field('body', $._module_type_ext))),
      repeat(field('item_attribute', $.item_attribute))
    ),

    open_statement: $ => seq(
      'open',
      optional('!'),
      optional($._attribute),
      field('module', $._simple_module_expression_ext),
      repeat(field('item_attribute', $.item_attribute))
    ),

    include_statement: $ => seq(
      'include',
      optional($._attribute),
      field('module', choice($._module_type_ext, $._simple_module_expression_ext)),
      repeat(field('item_attribute', $.item_attribute))
    ),

    class_definition: $ => seq(
      'class', optional($._attribute),
      sep1('and', field('binding', $.class_binding))
    ),

    class_binding: $ => prec.right(seq(
      optional('virtual'),
      optional(seq(
        '[',
        sep1(',', field('type_parameter', $.type_variable)),
        ']'
      )),
      field('name', $._class_name),
      repeat(field('parameter', $._parameter)),
      optional(seq(':', field('type', $._class_type_ext))),
      optional(seq('=', field('body', $._class_expression_ext))),
      repeat(field('item_attribute', $.item_attribute))
    )),

    class_type_definition: $ => seq(
      'class', 'type', optional($._attribute),
      sep1('and', field('binding', $.class_type_binding))
    ),

    class_type_binding: $ => seq(
      optional('virtual'),
      optional(seq(
        '[',
        sep1(',', field('type_parameter', $.type_variable)),
        ']'
      )),
      field('name', $._class_name),
      '=',
      field('body', $._simple_class_type_ext),
      repeat(field('item_attribute', $.item_attribute))
    ),

    // Module types

    _module_type: $ => choice(
      $.module_type_path,
      $.signature,
      $.module_type_constraint,
      $.module_type_of,
      $.functor_type,
      $.parenthesized_module_type
    ),

    _module_type_ext: $ => choice(
      $._module_type,
      $._extension
    ),

    signature: $ => seq(
      'sig',
      optional($._specifications),
      'end'
    ),

    module_type_constraint: $ => prec.right(seq(
      field('module_type', $._module_type_ext),
      'with',
      sep1('and', field('contraint', choice(
        $.constrain_type,
        $.constrain_module
      )))
    )),

    constrain_type: $ => seq(
      'type',
      optional(field('params', $.type_params)),
      field('constructor', $.type_constructor_path),
      $._type_equation,
      repeat(field('constraint', $.type_constraint))
    ),

    constrain_module: $ => seq(
      'module',
      field('left', $._simple_module_expression_ext),
      choice('=', ':='),
      field('right', $._simple_module_expression_ext)
    ),

    module_type_of: $ => seq(
      'module', 'type', 'of',
      field('module', $._simple_module_expression_ext)
    ),

    functor_type: $ => prec.right(seq(
      choice(
        seq(
          'functor',
          repeat(field('parameter', $.module_parameter))
        ),
        field('parameter', $._module_type_ext)
      ),
      '->',
      field('type', $._module_type_ext)
    )),

    parenthesized_module_type: $ => seq(
      parenthesize(field('body', $._module_type_ext))
    ),

    // Module expressions

    _simple_module_expression: $ => choice(
      $._module_name,
      $.structure,
      $.functor,
      $.module_application,
      $.submodule,
      $.typed_module_expression,
      $.parenthesized_module_expression
    ),

    _simple_module_expression_ext: $ => choice(
      $._simple_module_expression,
      $._extension
    ),

    _module_expression: $ => choice(
      $._simple_module_expression,
      $.packed_module
    ),

    _module_expression_ext: $ => choice(
      $._module_expression,
      $._extension
    ),

    structure: $ => seq(
      'struct',
      optional($._definitions),
      'end'
    ),

    functor: $ => seq(
      'functor',
      repeat1(field('parameter', $.module_parameter)),
      '->',
      field('body', $._simple_module_expression_ext),
    ),

    module_application: $ => prec.right(2, seq(
      field('module', $._simple_module_expression_ext),
      parenthesize(optional(field('argument', $._module_expression_ext)))
    )),

    submodule: $ => prec.left(1, seq(
      field('module', $._simple_module_expression_ext),
      '.',
      field('submodule', $._simple_module_expression_ext)
    )),

    typed_module_expression: $ => prec.right(seq(
      parenthesize(seq(
        field('module', $._simple_module_expression_ext),
        ':',
        field('type', $._module_type_ext)
      ))
    )),

    packed_module: $ => seq(
      'val',
      field('body', $._expression_ext),
      optional(seq(':', field('type', $._module_type_ext))),
      optional(seq(':>', field('coercion', $._module_type_ext)))
    ),

    parenthesized_module_expression: $ => prec.right(seq(
      parenthesize(field('body', $._module_expression_ext))
    )),

    // Class types

    _simple_class_type: $ => choice(
      $.class_type_path,
      $.instantiated_class_type,
      $.class_body_type,
      $.let_open_class_type
    ),

    _simple_class_type_ext: $ => choice(
      $._simple_class_type,
      $._extension,
    ),

    _class_type: $ => choice(
      $._simple_class_type,
      $.class_function_type
    ),

    _class_type_ext: $ => choice(
      $._class_type,
      $._extension
    ),

    instantiated_class_type: $ => seq(
      '[',
      sep1(',', field('type_argument', $._type_ext)),
      ']',
      field('class_type', $.class_type_path)
    ),

    class_body_type: $ => seq(
      'object',
      optional(parenthesize(field('self_type', $._type_ext))),
      repeat(choice(
        field('field', $._class_field_specification_ext),
        field('floating_attribute', $.floating_attribute)
      )),
      'end'
    ),

    _class_field_specification: $ => choice(
      $.inheritance_specification,
      $.instance_variable_specification,
      $.method_specification,
      $.type_parameter_constraint
    ),

    _class_field_specification_ext: $ => choice(
      $._class_field_specification,
      $._item_extension
    ),

    inheritance_specification: $ => seq(
      'inherit',
      field('class_type', $._simple_class_type_ext),
      repeat(field('item_attribute', $.item_attribute))
    ),

    instance_variable_specification: $ => seq(
      'val',
      repeat(choice('mutable', 'virtual')),
      field('name', $._instance_variable_name),
      ':',
      field('type', $._type_ext),
      repeat(field('item_attribute', $.item_attribute))
    ),

    method_specification: $ => seq(
      'method',
      repeat(choice('private', 'virtual')),
      field('name', $._method_name),
      ':',
      field('type', $._polymorphic_type),
      repeat(field('item_attribute', $.item_attribute))
    ),

    type_parameter_constraint: $ => seq(
      'constraint',
      field('left', $._type_ext),
      '=',
      field('right', $._type_ext),
      repeat(field('item_attribute', $.item_attribute))
    ),

    let_open_class_type: $ => prec.right(PREC.match, seq(
      'let',
      field('open', $.open_statement),
      'in',
      field('body', $._simple_class_type_ext)
    )),

    class_function_type: $ => prec.right(PREC.seq, seq(
      optional(seq(
        optional('?'),
        field('label', $._label_name),
        ':'
      )),
      field('parameter', $._tuple_type_ext),
      '->',
      field('class_type', $._class_type_ext)
    )),

    // Class expressions

    _simple_class_expression: $ => choice(
      $.class_path,
      $.instantiated_class,
      $.object_expression,
      $.typed_class_expression,
      $.parenthesized_class_expression
    ),

    _class_expression: $ => choice(
      $._simple_class_expression,
      $.class_function,
      $.class_application,
      $.let_class_expression,
      $.let_open_class_expression
    ),

    _class_expression_ext: $ => choice(
      $._class_expression,
      $._extension
    ),

    instantiated_class: $ => seq(
      '[',
      sep1(',', field('type_argument', $._type_ext)),
      ']',
      field('class', $.class_path)
    ),

    typed_class_expression: $ => seq(
      parenthesize(seq(
        field('class', $._class_expression_ext),
        ':',
        field('class_type', $._class_type_ext)
      ))
    ),

    class_function: $ => prec.right(PREC.match, seq(
      'fun',
      repeat1(field('parameter', $._parameter)),
      '->',
      field('body', $._class_expression_ext)
    )),

    class_application: $ => prec.right(PREC.app, seq(
      field('class', $._simple_class_expression),
      repeat1(field('argument', $._argument))
    )),

    let_class_expression: $ => prec.right(PREC.match, seq(
      field('definition', $.value_definition),
      'in',
      field('body', $._class_expression_ext)
    )),

    _class_field: $ => choice(
      $.inheritance_definition,
      $.instance_variable_definition,
      $.method_definition,
      $.type_parameter_constraint,
      $.class_initializer
    ),

    _class_field_ext: $ => choice(
      $._class_field,
      $._item_extension
    ),

    inheritance_definition: $ => seq(
      'inherit',
      optional('!'),
      field('class', $._class_expression_ext),
      optional(seq('as', field('name', $.value_name))),
      repeat(field('item_attribute', $.item_attribute))
    ),

    instance_variable_definition: $ => seq(
      'val',
      optional('!'),
      repeat(choice('mutable', 'virtual')),
      field('name', $._instance_variable_name),
      optional(seq(':', field('type', $._type_ext))),
      optional(seq(':>', field('coercion', $._type_ext))),
      optional(seq('=', field('body', $._sequence_expression_ext))),
      repeat(field('item_attribute', $.item_attribute))
    ),

    method_definition: $ => seq(
      'method',
      optional('!'),
      repeat(choice('private', 'virtual')),
      field('name', $._method_name),
      repeat(field('parameter', $._parameter)),
      optional(seq(':', field('type', $._polymorphic_type))),
      optional(seq('=', field('body', $._sequence_expression_ext))),
      repeat(field('item_attribute', $.item_attribute))
    ),

    class_initializer: $ => seq(
      'initializer',
      field('body', $._sequence_expression_ext),
      repeat(field('item_attribute', $.item_attribute))
    ),

    let_open_class_expression: $ => prec.right(PREC.match, seq(
      'let',
      field('open', $.open_statement),
      'in',
      field('body', $._class_expression_ext)
    )),

    parenthesized_class_expression: $ => seq(
      parenthesize(field('body', $._class_expression_ext))
    ),

    // Types

    _polymorphic_type: $ => choice(
      $.polymorphic_type,
      $._type_ext
    ),

    polymorphic_type: $ => seq(
      choice(
        repeat1(field('polymorphic', $.type_variable)),
        field('abstract', alias($._abstract_type, $.abstract_type))
      ),
      '.',
      field('type', $._type_ext)
    ),

    _abstract_type: $ => seq(
      'type',
      repeat1(field('type', $._type_constructor))
    ),

    _parenthesized_abstract_type: $ => parenthesize($._abstract_type),

    _simple_type: $ => choice(
      $.type_variable,
      $.type_constructor_path,
      $.constructed_type,
      $.polymorphic_variant_type,
      $.package_type,
      $.hash_type,
      $.object_type,
      $.parenthesized_type
    ),

    _simple_type_ext: $ => choice(
      $._simple_type,
      $._extension
    ),

    _tuple_type: $ => choice(
      $._simple_type,
      $.tuple_type
    ),

    _tuple_type_ext: $ => choice(
      $._tuple_type,
      $._extension
    ),

    _type: $ => choice(
      $._tuple_type,
      $.function_type,
      $.aliased_type,
    ),

    _type_ext: $ => choice(
      $._type,
      $._extension
    ),

    function_type: $ => prec.right(PREC.seq, seq(
      field('parameter', choice($.typed_label, $._type_ext)),
      '->',
      field('type', $._type_ext)
    )),

    typed_label: $ => prec.left(PREC.seq, seq(
      optional('?'),
      field('label', $._label_name),
      ':',
      field('type', $._type_ext)
    )),

    tuple_type: $ => prec(PREC.prod, seq(
      field('left', $._tuple_type_ext),
      '*',
      field('right', $._simple_type_ext)
    )),

    constructed_type: $ => prec(PREC.app, seq(
      choice(
        field('argument', $._simple_type_ext),
        parenthesize(sep1(',', field('argument', $._type_ext)))
      ),
      field('constructor', $.type_constructor_path)
    )),

    aliased_type: $ => prec(PREC.match, seq(
      field('body', $._type_ext),
      'as',
      field('name', $.type_variable)
    )),

    polymorphic_variant_type: $ => seq(
      choice(
        seq('[', field('exact', $.tag_specification), ']'),
        seq('[', optional(field('exact', $._tag_spec)), '|', sep1('|', field('exact', $._tag_spec)), ']'),
        seq('[>', optional('|'), sep('|', field('open', $._tag_spec)), ']'),
        seq(
          '[<', optional('|'), sep1('|', field('closed', $._tag_spec)),
          optional(seq('>', repeat1(field('open', $.tag)))), ']'),
      )
    ),

    _tag_spec: $ => choice(
      $._type_ext,
      $.tag_specification
    ),

    tag_specification: $ => seq(
      field('name', $.tag),
      optional(seq(
        'of',
        optional('&'),
        sep1('&', field('parameter', $._type_ext))
      ))
    ),

    package_type: $ => parenthesize(seq(
      'module',
      optional($._attribute),
      field('body', $._module_type_ext)
    )),

    object_type: $ => seq(
      '<',
      optional(choice(
        seq(
          sep1(';', choice(
            field('method', $.method_type),
            field('object', $._simple_type_ext)
          )),
          optional(seq(';', optional('..')))
        ),
        '..'
      )),
      '>'
    ),

    method_type: $ => seq(
      field('name', $._method_name),
      ':',
      field('type', $._polymorphic_type)
    ),

    hash_type: $ => prec(PREC.hash, seq(
      optional(choice(
        field('argument', $._simple_type_ext),
        parenthesize(sep1(',', field('argument', $._type_ext)))
      )),
      '#',
      field('class', $.class_path)
    )),

    parenthesized_type: $ => parenthesize(field('body', $._type_ext)),

    // Expressions

    _simple_expression: $ => choice(
      $.value_path,
      $._constant,
      $.typed_expression,
      $.constructor_path,
      $.tag,
      $.list_expression,
      $.array_expression,
      $.record_expression,
      $.prefix_expression,
      alias($.hash_expression, $.infix_expression),
      $.field_get_expression,
      $.array_get_expression,
      $.string_get_expression,
      $.bigarray_get_expression,
      $.coercion_expression,
      $.local_open_expression,
      $.package_expression,
      $.new_expression,
      $.object_copy_expression,
      $.method_invocation,
      $.parenthesized_expression,
      $.ocamlyacc_value
    ),

    _simple_expression_ext: $ => choice(
      $._simple_expression,
      $._extension
    ),

    _expression: $ => choice(
      $._simple_expression,
      $.product_expression,
      $.cons_expression,
      $.application_expression,
      $.infix_expression,
      alias($.sign_expression, $.prefix_expression),
      $.set_expression,
      $.if_expression,
      $.while_expression,
      $.for_expression,
      $.match_expression,
      $.function_expression,
      $.fun_expression,
      $.try_expression,
      $.let_expression,
      $.assert_expression,
      $.lazy_expression,
      $.let_module_expression,
      $.let_open_expression,
      $.let_exception_expression,
      $.object_expression
    ),

    _expression_ext: $ => choice(
      $._expression,
      $._extension
    ),

    _sequence_expression: $ => choice(
      $._expression,
      $.sequence_expression
    ),

    _sequence_expression_ext: $ => choice(
      $._sequence_expression,
      $._extension
    ),

    typed_expression: $ => parenthesize(seq(
      field('expression', $._sequence_expression_ext),
      ':',
      field('type', $._type_ext)
    )),

    product_expression: $ => prec.left(PREC.prod, seq(
      field('left', $._expression_ext),
      ',',
      field('right', $._expression_ext)
    )),

    cons_expression: $ => prec.right(PREC.cons, seq(
      field('left', $._expression_ext),
      '::',
      field('right', $._expression_ext)
    )),

    list_expression: $ => seq(
      '[',
      optional(seq(
        sep1(';', field('item', $._expression_ext)),
        optional(';')
      )),
      ']'
    ),

    array_expression: $ => seq(
      '[|',
      optional(seq(
        sep1(';', field('item', $._expression_ext)),
        optional(';')
      )),
      '|]'
    ),

    record_expression: $ => seq(
      '{',
      optional(seq(field('object', $._simple_expression_ext), 'with')),
      sep1(';', field('field', $.field_expression)),
      optional(';'),
      '}'
    ),

    field_expression: $ => prec(PREC.seq, seq(
      field('name', $.field_path),
      optional(seq(':', field('type', $._type_ext))),
      optional(seq('=', field('value', $._expression_ext)))
    )),

    application_expression: $ => prec.right(PREC.app, seq(
      field('expression', $._simple_expression_ext),
      repeat1(field('argument', $._argument))
    )),

    _argument: $ => choice(
      $._simple_expression_ext,
      $.label,
      $.labeled_argument
    ),

    labeled_argument: $ => seq(
      field('label', $.label),
      token.immediate(':'),
      field('argument', $._simple_expression_ext)
    ),

    prefix_expression: $ => prec(PREC.prefix, seq(
      field('operator', $.prefix_operator),
      field('expression', $._simple_expression_ext)
    )),

    sign_expression: $ => prec(PREC.neg, seq(
      field('operator', alias($._sign_operator, $.prefix_operator)),
      field('expression', $._expression_ext)
    )),

    hash_expression: $ => prec.left(PREC.hash, seq(
      field('left', $._simple_expression_ext),
      field('operator', alias($._hash_operator, $.infix_operator)),
      field('right', $._simple_expression_ext)
    )),

    infix_expression: $ => {
      const table = [
        {
          operator: $._pow_operator,
          precedence: PREC.pow,
          associativity: 'right'
        },
        {
          operator: $._mult_operator,
          precedence: PREC.mult,
          associativity: 'left'
        },
        {
          operator: $._add_operator,
          precedence: PREC.add,
          associativity: 'left'
        },
        {
          operator: $._concat_operator,
          precedence: PREC.concat,
          associativity: 'right'
        },
        {
          operator: $._rel_operator,
          precedence: PREC.rel,
          associativity: 'left'
        },
        {
          operator: $._and_operator,
          precedence: PREC.and,
          associativity: 'right'
        },
        {
          operator: $._or_operator,
          precedence: PREC.or,
          associativity: 'right'
        },
        {
          operator: $._assign_operator,
          precedence: PREC.assign,
          associativity: 'right'
        }
      ]

      return choice(...table.map(({operator, precedence, associativity}) =>
        prec[associativity](precedence, seq(
          field('left', $._expression_ext),
          field('operator', alias(operator, $.infix_operator)),
          field('right', $._expression_ext)
        ))
      ))
    },

    field_get_expression: $ => prec.left(PREC.dot, seq(
      field('record', $._simple_expression_ext),
      '.',
      field('field', $.field_path)
    )),

    array_get_expression: $ => prec(PREC.dot, seq(
      field('array', $._simple_expression_ext),
      '.',
      optional(field('operator', $.indexing_operator_path)),
      '(',
      field('index', $._sequence_expression_ext),
      ')'
    )),

    string_get_expression: $ => prec(PREC.dot, seq(
      field('string', $._simple_expression_ext),
      '.',
      optional(field('operator', $.indexing_operator_path)),
      '[',
      field('index', $._sequence_expression_ext),
      ']'
    )),

    bigarray_get_expression: $ => prec(PREC.dot, seq(
      field('array', $._simple_expression_ext),
      '.',
      optional(field('operator', $.indexing_operator_path)),
      '{',
      field('index', $._sequence_expression_ext),
      '}'
    )),

    set_expression: $ => prec.right(PREC.assign, seq(
      field('get', choice(
        $.field_get_expression,
        $.array_get_expression,
        $.string_get_expression,
        $.bigarray_get_expression,
        $._instance_variable_name
      )),
      '<-',
      field('value', $._expression_ext)
    )),

    if_expression: $ => prec.right(PREC.if, seq(
      'if',
      optional($._attribute),
      field('condition', $._sequence_expression_ext),
      field('then', $.then_clause),
      optional(field('else', $.else_clause))
    )),

    then_clause: $ => seq(
      'then',
      field('expression', $._expression_ext)
    ),

    else_clause: $ => seq(
      'else',
      field('expression', $._expression_ext)
    ),

    while_expression: $ => seq(
      'while',
      optional($._attribute),
      field('condition', $._sequence_expression_ext),
      field('do', $.do_clause)
    ),

    do_clause: $ => seq(
      'do',
      optional(field('expression', $._sequence_expression_ext)),
      'done'
    ),

    for_expression: $ => seq(
      'for',
      optional($._attribute),
      field('name', $.value_name),
      '=',
      field('from', $._sequence_expression_ext),
      choice('to', 'downto'),
      field('to', $._sequence_expression_ext),
      field('do', $.do_clause)
    ),

    sequence_expression: $ => prec.right(PREC.seq, seq(
      field('left', $._expression_ext),
      ';',
      optional(seq(
        optional(seq('%', $.attribute_id)),
        field('right', $._sequence_expression_ext)
      ))
    )),

    match_expression: $ => prec.right(PREC.match, seq(
      choice(
        seq('match', optional($._attribute)),
        field('operator', $.match_operator)
      ),
      field('expression', $._sequence_expression_ext),
      'with',
      $._match_cases
    )),

    _match_cases: $ => prec.right(seq(
      optional('|'),
      sep1('|', field('case', $.match_case))
    )),

    match_case: $ => seq(
      field('pattern', $._pattern_ext),
      optional(seq('when', field('guard', $._sequence_expression_ext))),
      '->',
      field('expression', choice($._sequence_expression_ext, $.refutation_case))
    ),

    refutation_case: $ => '.',

    function_expression: $ => prec.right(PREC.match, seq(
      'function',
      optional($._attribute),
      $._match_cases
    )),

    fun_expression: $ => prec.right(PREC.match, seq(
      'fun',
      optional($._attribute),
      repeat1(field('parameter', $._parameter)),
      optional(seq(':', field('type', $._simple_type_ext))),
      '->',
      field('body', $._sequence_expression_ext)
    )),

    try_expression: $ => prec.right(PREC.match, seq(
      'try',
      optional($._attribute),
      field('expression', $._sequence_expression_ext),
      'with',
      $._match_cases
    )),

    let_expression: $ => prec.right(PREC.match, seq(
      field('definition', $.value_definition),
      'in',
      field('body', $._sequence_expression_ext)
    )),

    coercion_expression: $ => parenthesize(seq(
      field('expression', $._sequence_expression_ext),
      optional(seq(':', field('type', $._type_ext))),
      ':>',
      field('coercion', $._type_ext)
    )),

    assert_expression: $ => prec.left(PREC.app, seq(
      'assert',
      optional($._attribute),
      field('expression', $._simple_expression_ext)
    )),

    lazy_expression: $ => prec.left(PREC.app, seq(
      'lazy',
      optional($._attribute),
      field('expression', $._simple_expression_ext)
    )),

    let_module_expression: $ => prec.right(PREC.match, seq(
      'let',
      field('definition', $.module_definition),
      'in',
      field('expression', $._sequence_expression_ext)
    )),

    let_open_expression: $ => prec.right(PREC.match, seq(
      'let',
      field('open', $.open_statement),
      'in',
      field('expression', $._sequence_expression_ext)
    )),

    local_open_expression: $ => seq(
      field('module', $._module_name),
      '.',
      choice(
        parenthesize(optional(field('expression', $._sequence_expression_ext))),
        field('expression', $.list_expression),
        field('expression', $.array_expression),
        field('expression', $.record_expression),
        field('expression', $.object_copy_expression),
        field('expression', $.local_open_expression)
      )
    ),

    package_expression: $ => parenthesize(seq(
      'module',
      optional($._attribute),
      field('module', $._simple_module_expression_ext),
      optional(seq(':', field('type', $._module_type_ext)))
    )),

    let_exception_expression: $ => prec.right(PREC.match, seq(
      'let',
      field('definition', $.exception_definition),
      'in',
      field('body', $._sequence_expression_ext)
    )),

    new_expression: $ => seq(
      'new',
      optional($._attribute),
      field('class', $.class_path)
    ),

    object_copy_expression: $ => seq(
      '{<',
      sep(';', field('variable', $.instance_variable_expression)),
      optional(';'),
      '>}'
    ),

    instance_variable_expression: $ => seq(
      field('name', $._instance_variable_name),
      optional(seq('=', field('value', $._expression_ext)))
    ),

    method_invocation: $ => prec.right(PREC.hash, seq(
      field('object', $._simple_expression_ext),
      '#',
      field('method', $._method_name)
    )),

    object_expression: $ => seq(
      'object',
      optional($._attribute),
      optional(parenthesize(seq(
        field('self', $._pattern_ext),
        optional(seq(':', field('self_type', $._type_ext)))
      ))),
      repeat(choice(
        field('field', $._class_field_ext),
        field('floating_attribute', $.floating_attribute)
      )),
      'end'
    ),

    parenthesized_expression: $ => choice(
      seq(
        'begin',
        optional($._attribute),
        field('expression', $._sequence_expression_ext),
        'end'
      ),
      parenthesize(field('expression', $._sequence_expression_ext))
    ),

    ocamlyacc_value: $ => /\$[0-9]+/,

    // Patterns

    _simple_pattern: $ => choice(
      $.value_name,
      $._signed_constant,
      $.typed_pattern,
      $.constructor_path,
      $.tag,
      $.polymorphic_variant_pattern,
      $.record_pattern,
      $.list_pattern,
      $.array_pattern,
      $.local_open_pattern,
      $.package_pattern,
      $.parenthesized_pattern
    ),

    _simple_pattern_ext: $ => choice(
      $._simple_pattern,
      $._extension
    ),

    _pattern: $ => choice(
      $._simple_pattern,
      $.alias_pattern,
      $.or_pattern,
      $.constructor_pattern,
      $.tag_pattern,
      $.tuple_pattern,
      $.cons_pattern,
      $.range_pattern,
      $.lazy_pattern,
      $.exception_pattern
    ),

    _pattern_ext: $ => choice(
      $._pattern,
      $._extension
    ),

    _pattern_no_exn: $ => choice(
      $._simple_pattern,
      alias($.alias_pattern_no_exn, $.alias_pattern),
      alias($.or_pattern_no_exn, $.or_pattern),
      $.constructor_pattern,
      $.tag_pattern,
      alias($.tuple_pattern_no_exn, $.tuple_pattern),
      alias($.cons_pattern_no_exn, $.cons_pattern),
      $.range_pattern,
      $.lazy_pattern
    ),

    _pattern_no_exn_ext: $ => choice(
      $._pattern_no_exn,
      $._extension
    ),

    alias_pattern: $ => prec.left(PREC.match, seq(
      field('pattern', $._pattern_ext),
      'as',
      field('name', $.value_name)
    )),

    alias_pattern_no_exn: $ => prec.left(PREC.match, seq(
      field('pattern', $._pattern_no_exn_ext),
      'as',
      field('name', $.value_name)
    )),

    typed_pattern: $ => seq(
      parenthesize(seq(
        field('pattern', $._pattern_ext),
        ':',
        field('type', $._type_ext)
      ))
    ),

    or_pattern: $ => prec.left(PREC.seq, seq(
      field('left', $._pattern_ext),
      '|',
      field('right', $._pattern_ext)
    )),

    or_pattern_no_exn: $ => prec.left(PREC.seq, seq(
      field('left', $._pattern_no_exn_ext),
      '|',
      field('right', $._pattern_ext)
    )),

    constructor_pattern: $ => prec.right(PREC.app, seq(
      field('constructor', $.constructor_path),
      field('pattern', $._pattern_ext)
    )),

    tag_pattern: $ => prec.right(PREC.app, seq(
      field('tag', $.tag),
      field('pattern', $._pattern_ext)
    )),

    polymorphic_variant_pattern: $ => seq(
      '#',
      field('polymorphic_variant', $.type_constructor_path)
    ),

    tuple_pattern: $ => prec.left(PREC.prod, seq(
      field('left', $._pattern_ext),
      ',',
      field('right', $._pattern_ext)
    )),

    tuple_pattern_no_exn: $ => prec.left(PREC.prod, seq(
      field('left', $._pattern_no_exn_ext),
      ',',
      field('right', $._pattern_ext)
    )),

    record_pattern: $ => prec.left(seq(
      '{',
      sep1(';', field('field', $.field_pattern)),
      optional(seq(';', '_')),
      optional(';'),
      '}'
    )),

    field_pattern: $ => seq(
      field('name', $.field_path),
      optional(seq(':', field('type', $._type_ext))),
      optional(seq('=', field('pattern', $._pattern_ext)))
    ),

    list_pattern: $ => prec.left(seq(
      '[',
      optional(seq(
        sep1(';', field('item', $._pattern_ext)),
        optional(';')
      )),
      ']'
    )),

    cons_pattern: $ => prec.right(PREC.cons, seq(
      field('left', $._pattern_ext),
      '::',
      field('right', $._pattern_ext)
    )),

    cons_pattern_no_exn: $ => prec.right(PREC.cons, seq(
      field('left', $._pattern_no_exn_ext),
      '::',
      field('right', $._pattern_ext)
    )),

    array_pattern: $ => prec.left(seq(
      '[|',
      optional(seq(
        sep1(';', field('item', $._pattern_ext)),
        optional(';')
      )),
      '|]'
    )),

    range_pattern: $ => prec(PREC.dot, seq(
      field('left', $._signed_constant),
      '..',
      field('right', $._signed_constant)
    )),

    lazy_pattern: $ => prec(PREC.hash, seq(
      'lazy',
      optional($._attribute),
      field('pattern', $._pattern_ext)
    )),

    local_open_pattern: $ => prec.left(seq(
      field('module', $._module_name),
      '.',
      choice(
        parenthesize(optional(field('pattern', $._pattern_ext))),
        field('pattern', $.list_pattern),
        field('pattern', $.array_pattern),
        field('pattern', $.record_pattern),
        field('pattern', $.local_open_pattern)
      )
    )),

    package_pattern: $ => seq(
      parenthesize(seq(
        'module',
        optional($._attribute),
        field('module', choice($._module_name, alias('_', $.module_name))),
        optional(seq(':', field('type', $._module_type_ext)))
      ))
    ),

    parenthesized_pattern: $ => seq(
      parenthesize(field('pattern', $._pattern_ext))
    ),

    exception_pattern: $ => seq(
      'exception',
      optional($._attribute),
      field('pattern', $._pattern_ext)
    ),

    // Attributes and extensions

    attribute: $ => seq(
      '[@',
      field('id', $.attribute_id),
      optional(field('payload', $.attribute_payload)),
      ']'
    ),

    item_attribute: $ => seq(
      '[@@',
      field('id', $.attribute_id),
      optional(field('payload', $.attribute_payload)),
      ']'
    ),

    floating_attribute: $ => seq(
      '[@@@',
      field('id', $.attribute_id),
      optional(field('payload', $.attribute_payload)),
      ']'
    ),

    attribute_payload: $ => choice(
      $._definitions,
      seq(':', choice(field('type', $._type_ext), $._specifications)),
      seq(
        '?',
        field('pattern', $._pattern_ext),
        optional(seq('when', field('guard', $._sequence_expression_ext)))
      )
    ),

    _extension: $ => choice(
      $.extension,
      $.quoted_extension
    ),

    extension: $ => seq(
      '[%',
      field('id', $.attribute_id),
      optional(field('payload', $.attribute_payload)),
      ']'
    ),

    quoted_extension: $ => seq(
      '{%',
      field('id', $.attribute_id),
      optional(/\s+/),
      field('payload', alias($._quoted_string, $.quoted_string)),
      '}'
    ),

    _item_extension: $ => choice(
      $.item_extension,
      $.quoted_item_extension
    ),

    item_extension: $ => seq(
      '[%%',
      field('id', $.attribute_id),
      optional(field('payload', $.attribute_payload)),
      ']',
      repeat(field('item_attribute', $.item_attribute))
    ),

    quoted_item_extension: $ => seq(
      '{%%',
      field('id', $.attribute_id),
      optional(/\s+/),
      field('payload', alias($._quoted_string, $.quoted_string)),
      '}',
      repeat($.item_attribute)
    ),

    _attribute: $ => seq('%', field('id', $.attribute_id)),

    // Constants

    _constant: $ => choice(
      $.number,
      $.character,
      $.string,
      $.quoted_string,
      $.boolean,
      $.unit
    ),

    _signed_constant: $ => choice(
      $._constant,
      $.signed_number
    ),

    number: $ => NUMBER,

    signed_number: $ => seq(
      choice('+', '-'),
      NUMBER
    ),

    character: $ => seq(
      "'",
      choice(
        /[^\\']/,
        $._null,
        field('escape', $.escape_sequence)
      ),
      "'"
    ),

    string: $ => seq(
      '"',
      repeat(choice(
        token.immediate(' '),
        token.immediate('[@'),
        /[^\\"%@]+|%|@/,
        $._null,
        field('escape', $.escape_sequence),
        field('escape', alias(/\\u\{[0-9A-Fa-f]+\}/, $.escape_sequence)),
        field('escape', alias(/\\\n[\t ]*/, $.escape_sequence)),
        field('conversion', $.conversion_specification),
        field('printing', $.pretty_printing_indication)
      )),
      '"'
    ),

    quoted_string: $ => seq(
      '{',
      $._quoted_string,
      '}'
    ),

    escape_sequence: $ => choice(
      /\\[\\"'ntbr ]/,
      /\\[0-9][0-9][0-9]/,
      /\\x[0-9A-Fa-f][0-9A-Fa-f]/,
      /\\o[0-3][0-7][0-7]/
    ),

    conversion_specification: $ => token(seq(
      '%',
      optional(/[\-0+ #]/),
      optional(/[1-9][0-9]*|\*/),
      optional(/\.([0-9]*|\*)/),
      choice(
        /[diunlLNxXosScCfFeEgGhHbBat!%@,]/,
        /[lnL][diuxXo]/
      )
    )),

    pretty_printing_indication: $ => /@([\[\], ;.{}?]|\\n|<[0-9]+>)/,

    boolean: $ => choice('true', 'false'),

    unit: $ => choice(
      seq('(', ')'),
      seq('begin', 'end')
    ),

    // Operators

    prefix_operator: $ => token(choice(
      seq('!', choice(optional(/[!$%&*+\-./:<>?@^|~]/), repeat2(OP_CHAR))),
      seq(/[~?]/, repeat1(OP_CHAR))
    )),

    _sign_operator: $ => choice('+', '-', '+.', '-.'),

    infix_operator: $ => choice(
      $._hash_operator,
      $._pow_operator,
      $._mult_operator,
      $._add_operator,
      $._concat_operator,
      $._rel_operator,
      $._and_operator,
      $._or_operator,
      $._assign_operator
    ),

    _hash_operator: $ => /#[#!$%&*+\-./:<=>?@^|~]+/,

    _pow_operator: $ => choice(
      token(seq('**', repeat(OP_CHAR))),
      'lsl', 'lsr', 'asr'
    ),

    _mult_operator: $ => choice(
      token(seq(/[*/%]/, repeat(OP_CHAR))),
      'mod', 'land', 'lor', 'lxor'
    ),

    _add_operator: $ => token(choice(
      seq('+', repeat(OP_CHAR)),
      seq('-', choice(optional(/[!$%&*+\-./:<=?@^|~]/), repeat2(OP_CHAR))),
    )),

    _concat_operator: $ => token(
      seq(/[@^]/, repeat(OP_CHAR))
    ),

    _rel_operator: $ => token(choice(
      seq(/[=>$]/, repeat(OP_CHAR)),
      seq('<', choice(optional(/[!$%&*+./:<=>?@^|~]/), repeat2(OP_CHAR))),
      seq('&', choice(/[!$%*+\-./:<=>?@^|~]/, repeat2(OP_CHAR))),
      seq('|', choice(/[!$%&*+\-./:<=>?@^~]/, repeat2(OP_CHAR))),
      '!='
    )),

    _and_operator: $ => choice('&', '&&'),

    _or_operator: $ => choice('or', '||'),

    _assign_operator: $ => choice(':='),

    indexing_operator: $ => token(
      seq(/[!$%&*+\-/:=>?@^|]/, repeat(OP_CHAR))
    ),

    indexing_operator_path: $ => choice(
      $.indexing_operator,
      seq($._module_name, '.', $.indexing_operator_path)
    ),

    let_operator: $ => token(
      seq('let', /[$&*+\-/<=>@^|]/, repeat(OP_CHAR))
    ),

    and_operator: $ => token(
      seq('and', /[$&*+\-/<=>@^|]/, repeat(OP_CHAR))
    ),

    match_operator: $ => token(
      seq('match', /[$&*+\-/<=>@^|]/, repeat(OP_CHAR))
    ),

    // Names

    value_name: $ => choice(
      field('identifier', $._identifier),
      parenthesize(choice(
        field('operator', $.prefix_operator),
        field('operator', alias($._sign_operator, $.infix_operator)),
        field('operator', $.infix_operator),
        seq(
          '.',
          field('operator', $.indexing_operator),
          choice(
            seq('(', optional(seq(';', '..')), ')'),
            seq('[', optional(seq(';', '..')), ']'),
            seq('{', optional(seq(';', '..')), '}')
          ),
          optional('<-')
        ),
        field('operator', $.let_operator),
        field('operator', $.and_operator),
        field('operator', $.match_operator)
      ))
    ),

    value_path: $ => choice(
      field('name', $.value_name),
      seq(
        field('module', $._module_name),
        '.',
        field('path', $.value_path)
      )
    ),

    module_type_path: $ => choice(
      field('name', $._module_type_name),
      seq(
        $._extended_module_name,
        '.',
        field('path', $.module_type_path)
      )
    ),

    field_path: $ => choice(
      field('name', $._field_name),
      seq(
        field('module', $._module_name),
        '.',
        field('path', $.field_path)
      )
    ),

    constructor_path: $ => prec.right(choice(
      field('name', $._constructor_name),
      seq(
        field('module', $._module_name),
        '.',
        field('path', $.constructor_path)
      )
    )),

    _extended_module_name: $ => seq(
      field('module', $._module_name),
      repeat(parenthesize(field('argument', $.module_path)))
    ),

    module_path: $ => choice(
      $._extended_module_name,
      seq($._extended_module_name, '.', field('path', $.module_path))
    ),

    type_constructor_path: $ => choice(
      field('name', $._type_constructor),
      seq(
        $._extended_module_name,
        '.',
        field('path', $.type_constructor_path)
      )
    ),

    class_type_path: $ => prec(1, choice(
      field('name', $._class_name),
      seq(
        $._extended_module_name,
        '.',
        field('path', $.class_type_path)
      )
    )),

    class_path: $ => choice(
      field('name', $._class_name),
      seq(
        $._module_name,
        '.',
        field('path', $.class_path)
      )
    ),

    _label_name: $ => alias($._identifier, $.label_name),
    _field_name: $ => alias($._identifier, $.field_name),
    _class_name: $ => alias($._identifier, $.class_name),
    _method_name: $ => alias($._identifier, $.method_name),
    _type_constructor: $ => alias($._identifier, $.type_constructor),
    _instance_variable_name: $ => alias($._identifier, $.instance_variable_name),

    _module_name: $ => alias($._capitalized_identifier, $.module_name),
    _module_type_name: $ => alias(choice($._capitalized_identifier, $._identifier), $.module_type_name),
    _constructor_name: $ => choice(
      alias($._capitalized_identifier, $.constructor_name),
      parenthesize(alias('::', $.constructor_name))
    ),

    _identifier: $ => /[a-z_][a-zA-Z0-9_']*/,
    _capitalized_identifier: $ => /[A-Z][a-zA-Z0-9_']*/,

    label: $ => seq(choice('~', '?'), $._label_name),
    directive: $ => seq('#', choice($._identifier, $._capitalized_identifier)),
    type_variable: $ => seq("'", choice($._identifier, $._capitalized_identifier)),
    tag: $ => seq('`', choice($._identifier, $._capitalized_identifier)),
    attribute_id: $ => sep1('.', choice($._identifier, $._capitalized_identifier))
  },

  conflicts: $ => [
    [$._simple_module_expression, $.module_type_path],
    [$._simple_module_expression, $._extended_module_name],
    [$._simple_module_expression, $.value_path],
    [$.parenthesized_module_type, $.parenthesized_module_expression],
    [$.functor_type, $.functor]
  ],

  externals: $ => [
    $.comment,
    $._quoted_string,
    '"',
    $.line_number_directive,
    $._null
  ]
})

function sep(delimiter, rule) {
  return optional(sep1(delimiter, rule))
}

function sep1(delimiter, rule) {
  return seq(rule, repeat(seq(delimiter, rule)))
}

function repeat2(rule) {
  return seq(rule, repeat1(rule))
}

function parenthesize(rule) {
  return seq('(', rule, ')')
}
