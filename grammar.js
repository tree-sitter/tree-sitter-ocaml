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

const COMMENT = $ => seq(
  '(*',
  repeat(choice(
    alias($._comment, $.comment),
    /'([^'\\]|\\[\\"'ntbr ]|\\[0-9][0-9][0-9]|\\x[0-9A-Fa-f][0-9A-Fa-f]|\\o[0-3][0-7][0-7])'/,
    /"([^\\"]|\\(.|\n))*"/,
    seq(
      token(seq('{', optional(seq(/%%?/, sep1('.', /[A-Za-z_][a-zA-Z0-9_']*/), /\s*/)))),
      optional(seq(
        $._quoted_string,
        '}'
      ))
    ),
    /[A-Za-z_][a-zA-Z0-9_']*/,
    /[^('"{*A-Za-z_]+/,
    '(', "'", '*',
  )),
  '*)'
)

module.exports = grammar({
  name: 'ocaml',

  extras: $ => [
    /\s/,
    $.comment,
    $.line_number_directive
  ],

  inline: $ => [
    $._sequence_expression,
    $._pow_operator,
    $._mult_operator,
    $._label_name,
    $._field_name,
    $._class_name,
    $._method_name,
    $._module_name,
    $._module_type_name,
    $._type_constructor,
    $._instance_variable_name,
    $._constructor_name
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
    $._type,
    $._tag_spec,
    $._simple_expression,
    $._expression,
    $._sequence_expression,
    $._simple_pattern,
    $._pattern,
    $._pattern_no_exn,
    $._extension,
    $._item_extension,
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
          field('item', $._module_item),
          field('directive', $.toplevel_directive),
          field('item', $.expression_item)
        ),
        repeat(choice(
          seq(
            repeat(';;'),
            choice(
              field('item', $._module_item),
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
      field('expression', $._sequence_expression),
      repeat(field('item_attribute', $.item_attribute))
    ),

    _specifications: $ => choice(
      repeat1(';;'),
      seq(
        repeat1(seq(repeat(';;'), field('item', $._module_item))),
        repeat(';;')
      )
    ),

    // Toplevel

    toplevel_directive: $ => seq(
      field('name', $.directive),
      optional(field('payload', choice(
        $.constant,
        alias($._value_path, $.value_path),
        $._simple_module_expression
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
      $.floating_attribute,
      $._item_extension
    ),

    value_specification: $ => seq(
      'val',
      optional($._extension_attribute),
      field('name', alias($._value_name, $.value_name)),
      ':',
      field('type', $._type),
      repeat(field('item_attribute', $.item_attribute))
    ),

    value_definition: $ => seq(
      choice(
        seq('let', optional($._extension_attribute), optional('rec')),
        field('let', $.let_operator)
      ),
      sep1(
        choice(
          seq('and', repeat(field('attribute', $.attribute))),
          field('and', $.and_operator)
        ),
        field('binding', $.let_binding)
      )
    ),

    let_binding: $ => seq(
      field('name', $._pattern_no_exn),
      repeat(field('parameter', $._parameter)),
      optional(seq(':', field('type', $._polymorphic_type))),
      optional(seq(':>', field('coercion', $._type))),
      '=',
      field('body', $._sequence_expression),
      repeat(field('item_attribute', $.item_attribute))
    ),

    _parameter: $ => choice(
      $.parameter,
      alias($._parenthesized_abstract_type, $.abstract_type)
    ),

    parameter: $ => choice(
      field('name', $._simple_pattern),
      field('label', $.label),
      seq(
        field('label', $.label),
        token.immediate(':'),
        field('name', $._simple_pattern)
      ),
      seq(
        choice('~', '?'),
        '(',
        field('label', $._label_name),
        optional(seq(':', field('type', $._type))),
        optional(seq('=', field('default', $._sequence_expression))),
        ')'
      ),
      seq(
        field('label', $.label),
        token.immediate(':'),
        '(',
        field('name', $._pattern),
        optional(seq(':', field('type', $._type))),
        seq('=', field('label', $._sequence_expression)),
        ')'
      )
    ),

    external: $ => seq(
      'external',
      optional($._extension_attribute),
      field('name', alias($._value_name, $.value_name)),
      ':',
      field('type', $._type),
      '=',
      repeat1(field('declaration', $.string)),
      repeat(field('item_attribute', $.item_attribute))
    ),

    type_definition: $ => seq(
      'type',
      optional($._extension_attribute),
      optional('nonrec'),
      sep1(
        seq('and', repeat(field('attribute', $.attribute))),
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
          field('name', alias($._type_constructor_path, $.type_constructor_path)),
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
        alias($._type_variable, $.type_variable),
        alias('_', $.type_variable)
      ))
    ),

    _type_equation: $ => seq(
      choice('=', ':='),
      optional('private'),
      field('type', $._type)
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
        seq(':', field('type', $._simple_type)),
        seq(':', field('argument', $.constructor_argument), '->', field('type', $._simple_type)),
        seq('=', field('equation', alias($._constructor_path, $.constructor_path)))
      )),
      repeat(field('attribute', $.attribute))
    ),

    constructor_argument: $ => choice(
      sep1('*', field('type', $._simple_type)),
      field('record', $.record_declaration)
    ),

    record_declaration: $ => seq(
      '{',
      sep1(seq(';', repeat(field('attribute', $.attribute))),
        field('field', $.field_declaration)
      ),
      optional(seq(';', repeat(field('attribute', $.attribute)))),
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
      field('left', $._type),
      '=',
      field('right', $._type)
    ),

    exception_definition: $ => seq(
      'exception',
      optional($._extension_attribute),
      field('constructor', $.constructor_declaration),
      repeat(field('item_attribute', $.item_attribute))
    ),

    module_definition: $ => seq(
      'module', optional($._extension_attribute), optional('rec'),
      sep1(seq('and', repeat(field('attribute', $.attribute))),
        field('binding', $.module_binding)
      )
    ),

    module_binding: $ => seq(
      field('name', choice($._module_name, alias('_', $.module_name))),
      repeat(field('parameter', $.module_parameter)),
      optional(seq(':', field('type', $._module_type))),
      optional(seq('=', field('body', $._simple_module_expression))),
      repeat(field('item_attribute', $.item_attribute))
    ),

    module_parameter: $ => parenthesize(optional(seq(
      field('name', choice($._module_name, alias('_', $.module_name))),
      ':',
      field('type', $._module_type)
    ))),

    module_type_definition: $ => seq(
      'module', 'type',
      optional($._extension_attribute),
      field('name', $._module_type_name),
      optional(seq('=', field('body', $._module_type))),
      repeat(field('item_attribute', $.item_attribute))
    ),

    open_statement: $ => seq(
      'open',
      optional('!'),
      optional($._extension_attribute),
      field('module', $._simple_module_expression),
      repeat(field('item_attribute', $.item_attribute))
    ),

    include_statement: $ => seq(
      'include',
      optional($._extension_attribute),
      field('module', choice($._module_type, $._simple_module_expression)),
      repeat(field('item_attribute', $.item_attribute))
    ),

    class_definition: $ => seq(
      'class', optional($._extension_attribute),
      sep1(seq('and', repeat(field('attribute', $.attribute))),
        field('binding', $.class_binding)
      )
    ),

    class_binding: $ => prec.right(seq(
      optional('virtual'),
      optional(seq(
        '[',
        sep1(',', field('type_parameter', alias($._type_variable, $.type_variable))),
        ']'
      )),
      field('name', $._class_name),
      repeat(field('parameter', $._parameter)),
      optional(seq(':', field('type', $._class_type))),
      optional(seq('=', field('body', $._class_expression))),
      repeat(field('item_attribute', $.item_attribute))
    )),

    class_type_definition: $ => seq(
      'class', 'type', optional($._extension_attribute),
      sep1(seq('and', repeat(field('attribute', $.attribute))),
        field('binding', $.class_type_binding)
      )
    ),

    class_type_binding: $ => seq(
      optional('virtual'),
      optional(seq(
        '[',
        sep1(',', field('type_parameter', alias($._type_variable, $.type_variable))),
        ']'
      )),
      field('name', $._class_name),
      '=',
      field('body', $._simple_class_type),
      repeat(field('item_attribute', $.item_attribute))
    ),

    // Module types

    _module_type: $ => choice(
      $.module_type_path,
      $.signature,
      $.module_type_constraint,
      $.module_type_of,
      $.functor_type,
      $.parenthesized_module_type,
      $._extension
    ),

    module_type_path: $ => seq(
      field('path', $._module_type_path),
      repeat(field('attribute', $.attribute))
    ),

    signature: $ => seq(
      'sig',
      repeat(field('attribute', $.attribute)),
      optional($._specifications),
      'end',
      repeat(field('attribute', $.attribute))
    ),

    module_type_constraint: $ => prec.right(seq(
      field('module_type', $._module_type),
      'with',
      sep1('and', field('contraint', choice(
        $.constrain_type,
        $.constrain_module
      )))
    )),

    constrain_type: $ => seq(
      'type',
      optional(field('params', $.type_params)),
      field('constructor', alias($._type_constructor_path, $.type_constructor_path)),
      $._type_equation,
      repeat(field('constraint', $.type_constraint))
    ),

    constrain_module: $ => seq(
      'module',
      field('left', $._simple_module_expression),
      choice('=', ':='),
      field('right', $._simple_module_expression)
    ),

    module_type_of: $ => seq(
      'module', 'type', 'of',
      repeat(field('attribute', $.attribute)),
      field('module', $._simple_module_expression)
    ),

    functor_type: $ => prec.right(seq(
      choice(
        seq(
          'functor',
          repeat(field('attribute', $.attribute)),
          repeat(field('parameter', $.module_parameter))
        ),
        field('parameter', $._module_type)
      ),
      '->',
      field('type', $._module_type)
    )),

    parenthesized_module_type: $ => seq(
      parenthesize(field('body', $._module_type)),
      repeat(field('attribute', $.attribute))
    ),

    // Module expressions

    _simple_module_expression: $ => choice(
      $.module_name,
      $.structure,
      $.functor,
      $.module_application,
      $.submodule,
      $.typed_module_expression,
      $.parenthesized_module_expression,
      $._extension
    ),

    _module_expression: $ => choice(
      $._simple_module_expression,
      $.packed_module
    ),

    module_name: $ => prec.dynamic(1, prec.right(seq(
      field('name', $._capitalized_identifier),
      repeat(field('attribute', $.attribute))
    ))),

    structure: $ => prec.right(seq(
      'struct',
      repeat(field('attribute', $.attribute)),
      optional($._definitions),
      'end',
      repeat(field('attribute', $.attribute))
    )),

    functor: $ => seq(
      'functor',
      repeat(field('attribute', $.attribute)),
      repeat1(field('parameter', $.module_parameter)),
      '->',
      field('body', $._simple_module_expression),
    ),

    module_application: $ => prec.right(2, seq(
      field('module', $._simple_module_expression),
      parenthesize(optional(field('argument', $._module_expression))),
      repeat(field('attribute', $.attribute))
    )),

    submodule: $ => prec.left(1, seq(
      field('module', $._simple_module_expression),
      '.',
      field('submodule', $._simple_module_expression)
    )),

    typed_module_expression: $ => prec.right(seq(
      parenthesize(seq(
        field('module', $._simple_module_expression),
        ':',
        field('type', $._module_type)
      )),
      repeat(field('attribute', $.attribute))
    )),

    packed_module: $ => seq(
      'val',
      repeat(field('attribute', $.attribute)),
      field('body', $._expression),
      optional(seq(':', field('type', $._module_type))),
      optional(seq(':>', field('coercion', $._module_type)))
    ),

    parenthesized_module_expression: $ => prec.right(seq(
      parenthesize(field('body', $._module_expression)),
      repeat(field('attribute', $.attribute))
    )),

    // Class types

    _simple_class_type: $ => choice(
      $.class_type_path,
      $.instantiated_class_type,
      $.class_body_type,
      $.let_open_class_type,
      $._extension
    ),

    _class_type: $ => choice(
      $._simple_class_type,
      $.class_function_type,
    ),

    class_type_path: $ => seq(
      field('path', $._class_type_path),
      repeat(field('attribute', $.attribute))
    ),

    instantiated_class_type: $ => seq(
      '[',
      sep1(',', field('type_argument', $._type)),
      ']',
      field('class_type', $.class_type_path)
    ),

    class_body_type: $ => seq(
      'object',
      repeat(field('attribute', $.attribute)),
      optional(parenthesize(field('self_type', $._type))),
      repeat(choice(
        field('field', $._class_field_specification),
        field('floating_attribute', $.floating_attribute)
      )),
      'end',
      repeat(field('attribute', $.attribute))
    ),

    _class_field_specification: $ => choice(
      $.inheritance_specification,
      $.instance_variable_specification,
      $.method_specification,
      $.type_parameter_constraint,
      $._item_extension
    ),

    inheritance_specification: $ => seq(
      'inherit',
      repeat(field('attribute', $.attribute)),
      field('class_type', $._simple_class_type),
      repeat(field('item_attribute', $.item_attribute))
    ),

    instance_variable_specification: $ => seq(
      'val',
      repeat(field('attribute', $.attribute)),
      repeat(choice('mutable', 'virtual')),
      field('name', $._instance_variable_name),
      ':',
      field('type', $._type),
      repeat(field('item_attribute', $.item_attribute))
    ),

    method_specification: $ => seq(
      'method',
      repeat(field('attribute', $.attribute)),
      repeat(choice('private', 'virtual')),
      field('name', $._method_name),
      ':',
      field('type', $._polymorphic_type),
      repeat(field('item_attribute', $.item_attribute))
    ),

    type_parameter_constraint: $ => prec.right(seq(
      'constraint',
      repeat(field('attribute', $.attribute)),
      field('left', $._type),
      '=',
      field('right', $._type),
      repeat(field('item_attribute', $.item_attribute))
    )),

    let_open_class_type: $ => prec.right(PREC.match, seq(
      'let',
      field('open', $.open_statement),
      'in',
      field('body', $._simple_class_type)
    )),

    class_function_type: $ => prec.right(PREC.seq, seq(
      optional(seq(
        optional('?'),
        field('label', $._label_name),
        ':'
      )),
      field('parameter', $._tuple_type),
      '->',
      field('class_type', $._class_type)
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
      $.let_open_class_expression,
      $._extension
    ),

    class_path: $ => prec.right(seq(
      field('path', $._class_path),
      repeat(field('attribute', $.attribute))
    )),

    instantiated_class: $ => seq(
      '[',
      sep1(',', field('type_argument', $._type)),
      ']',
      field('class', $.class_path)
    ),

    typed_class_expression: $ => seq(
      parenthesize(seq(
        field('class', $._class_expression),
        ':',
        field('class_type', $._class_type)
      )),
      repeat(field('attribute', $.attribute))
    ),

    class_function: $ => prec.right(PREC.match, seq(
      'fun',
      repeat(field('attribute', $.attribute)),
      repeat1(field('parameter', $._parameter)),
      '->',
      field('body', $._class_expression)
    )),

    class_application: $ => prec.right(PREC.app, seq(
      field('class', $._simple_class_expression),
      repeat1(field('argument', $._argument)),
      repeat(field('attribute', $.attribute))
    )),

    let_class_expression: $ => prec.right(PREC.match, seq(
      field('definition', $.value_definition),
      'in',
      field('body', $._class_expression)
    )),

    _class_field: $ => choice(
      $.inheritance_definition,
      $.instance_variable_definition,
      $.method_definition,
      $.type_parameter_constraint,
      $.class_initializer,
      $._item_extension
    ),

    inheritance_definition: $ => seq(
      'inherit',
      optional('!'),
      repeat(field('attribute', $.attribute)),
      field('class', $._class_expression),
      optional(seq('as', field('name', alias($._value_name, $.value_name)))),
      repeat(field('item_attribute', $.item_attribute))
    ),

    instance_variable_definition: $ => seq(
      'val',
      optional('!'),
      repeat(field('attribute', $.attribute)),
      repeat(choice('mutable', 'virtual')),
      field('name', $._instance_variable_name),
      optional(seq(':', field('type', $._type))),
      optional(seq(':>', field('coercion', $._type))),
      optional(seq('=', field('body', $._sequence_expression))),
      repeat(field('item_attribute', $.item_attribute))
    ),

    method_definition: $ => seq(
      'method',
      optional('!'),
      repeat(field('attribute', $.attribute)),
      repeat(choice('private', 'virtual')),
      field('name', $._method_name),
      repeat(field('parameter', $._parameter)),
      optional(seq(':', field('type', $._polymorphic_type))),
      optional(seq('=', field('body', $._sequence_expression))),
      repeat(field('item_attribute', $.item_attribute))
    ),

    class_initializer: $ => seq(
      'initializer',
      repeat(field('attribute', $.attribute)),
      field('body', $._sequence_expression),
      repeat(field('item_attribute', $.item_attribute))
    ),

    let_open_class_expression: $ => prec.right(PREC.match, seq(
      'let',
      field('open', $.open_statement),
      'in',
      field('body', $._class_expression)
    )),

    parenthesized_class_expression: $ => seq(
      parenthesize(field('body', $._class_expression)),
      repeat(field('attribute', $.attribute))
    ),

    // Types

    _polymorphic_type: $ => choice(
      $.polymorphic_type,
      $._type
    ),

    polymorphic_type: $ => seq(
      choice(
        repeat1(field('polymorphic', alias($._type_variable, $.type_variable))),
        field('abstract', alias($._abstract_type, $.abstract_type))
      ),
      '.',
      field('type', $._type)
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
      $.parenthesized_type,
      $._extension
    ),

    _tuple_type: $ => prec(1, choice(
      $._simple_type,
      $.tuple_type
    )),

    _type: $ => choice(
      $._tuple_type,
      $.function_type,
      $.aliased_type
    ),

    type_variable: $ => prec.right(seq(
      field('name', $._type_variable),
      repeat(field('attribute', $.attribute))
    )),

    type_constructor_path: $ => prec.right(seq(
      field('path', $._type_constructor_path),
      repeat(field('attribute', $.attribute))
    )),

    function_type: $ => prec.right(PREC.seq, seq(
      field('parameter', choice($.typed_label, $._type)),
      '->',
      field('type', $._type)
    )),

    typed_label: $ => prec.left(PREC.seq, seq(
      optional('?'),
      field('label', $._label_name),
      ':',
      field('type', $._type)
    )),

    tuple_type: $ => prec(PREC.prod, seq(
      field('left', choice(
        $._simple_type,
        $.tuple_type
      )),
      '*',
      field('right', $._simple_type)
    )),

    constructed_type: $ => prec(PREC.app, seq(
      choice(
        field('argument', $._simple_type),
        parenthesize(sep1(',', field('argument', $._type)))
      ),
      field('constructor', $.type_constructor_path)
    )),

    aliased_type: $ => prec(PREC.match, seq(
      field('body', $._type),
      'as',
      field('name', $.type_variable)
    )),

    polymorphic_variant_type: $ => prec.right(seq(
      choice(
        seq('[', optional('|'), sep1('|', field('exact', $._tag_spec)), ']'),
        seq('[>', optional('|'), sep('|', field('open', $._tag_spec)), ']'),
        seq(
          '[<', optional('|'), sep1('|', field('closed', $._tag_spec)),
          optional(seq('>', repeat1(field('open', $.tag)))), ']'),
      ),
      repeat(field('attribute', $.attribute))
    )),

    _tag_spec: $ => choice(
      $._simple_type,
      $.tag_specification
    ),

    tag_specification: $ => seq(
      field('name', $.tag),
      optional(seq(
        'of',
        optional('&'),
        sep1('&', field('parameter', $._type))
      )),
      repeat(field('attribute', $.attribute))
    ),

    package_type: $ => prec.right(seq(
      parenthesize(seq(
        'module',
        optional($._extension_attribute),
        field('body', $._module_type)
      )),
      repeat(field('attribute', $.attribute))
    )),

    object_type: $ => prec.right(seq(
      '<',
      optional(choice(
        seq(
          sep1(';', choice(
            field('method', $.method_type),
            field('object', $._simple_type)
          )),
          optional(seq(
            ';',
            repeat(field('attribute', $.attribute)),
            optional('..')
          ))
        ),
        '..'
      )),
      '>',
      repeat(field('attribute', $.attribute))
    )),

    method_type: $ => seq(
      field('name', $._method_name),
      ':',
      field('type', $._polymorphic_type)
    ),

    hash_type: $ => prec(PREC.hash, seq(
      optional(choice(
        field('argument', $._simple_type),
        parenthesize(sep1(',', field('argument', $._type)))
      )),
      '#',
      field('class', $.class_path)
    )),

    parenthesized_type: $ => prec.right(seq(
      parenthesize(field('body', $._type)),
      repeat(field('attribute', $.attribute))
    )),

    // Expressions

    _simple_expression: $ => choice(
      $.value_path,
      $.constant,
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
      $.ocamlyacc_value,
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

    _sequence_expression: $ => choice(
      $._expression,
      $.sequence_expression
    ),

    value_path: $ => prec.right(seq(
      field('path', $._value_path),
      repeat(field('attribute', $.attribute))
    )),

    typed_expression: $ => prec.right(seq(
      parenthesize(seq(
        field('expression', $._sequence_expression),
        ':',
        field('type', $._type)
      )),
      repeat(field('attribute', $.attribute))
    )),

    constructor_path: $ => prec.right(seq(
      field('path', $._constructor_path),
      repeat(field('attribute', $.attribute))
    )),

    tag: $ => prec.right(seq(
      field('name', $._tag),
      repeat(field('attribute', $.attribute))
    )),

    product_expression: $ => prec.left(PREC.prod, seq(
      field('left', $._expression),
      ',',
      field('right', $._expression)
    )),

    cons_expression: $ => prec.right(PREC.cons, seq(
      field('left', $._expression),
      '::',
      field('right', $._expression)
    )),

    list_expression: $ => prec.right(seq(
      '[',
      optional(seq(
        sep1(';', field('item', $._expression)),
        optional(';')
      )),
      ']',
      repeat(field('attribute', $.attribute))
    )),

    array_expression: $ => prec.right(seq(
      '[|',
      optional(seq(
        sep1(';', field('item', $._expression)),
        optional(';')
      )),
      '|]',
      repeat(field('attribute', $.attribute))
    )),

    record_expression: $ => prec.right(seq(
      '{',
      optional(seq(field('object', $._simple_expression), 'with')),
      sep1(';', field('field', $.field_expression)),
      optional(';'),
      '}',
      repeat(field('attribute', $.attribute))
    )),

    field_expression: $ => prec.left(PREC.seq, seq(
      field('name', $.field_path),
      optional(seq(':', field('type', $._type))),
      optional(seq('=', field('value', $._expression)))
    )),

    application_expression: $ => prec.right(PREC.app, seq(
      field('expression', $._simple_expression),
      repeat1(field('argument', $._argument)),
      repeat(field('attribute', $.attribute))
    )),

    _argument: $ => choice(
      $._simple_expression,
      $.label,
      $.labeled_argument
    ),

    labeled_argument: $ => seq(
      field('label', $.label),
      token.immediate(':'),
      field('argument', $._simple_expression)
    ),

    prefix_expression: $ => prec(PREC.prefix, seq(
      field('operator', $.prefix_operator),
      field('expression', $._simple_expression)
    )),

    sign_expression: $ => prec(PREC.neg, seq(
      field('operator', alias($._sign_operator, $.prefix_operator)),
      field('expression', $._expression)
    )),

    hash_expression: $ => prec.left(PREC.hash, seq(
      field('left', $._simple_expression),
      field('operator', alias($._hash_operator, $.infix_operator)),
      field('right', $._simple_expression)
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
          field('left', $._expression),
          field('operator', alias(operator, $.infix_operator)),
          field('right', $._expression)
        ))
      ))
    },

    field_get_expression: $ => prec.left(PREC.dot, seq(
      field('record', $._simple_expression),
      '.',
      field('field', $.field_path),
      repeat(field('attribute', $.attribute))
    )),

    array_get_expression: $ => prec.right(PREC.dot, seq(
      field('array', $._simple_expression),
      '.',
      optional(field('operator', $.indexing_operator_path)),
      '(',
      field('index', $._sequence_expression),
      ')',
      repeat(field('attribute', $.attribute))
    )),

    string_get_expression: $ => prec.right(PREC.dot, seq(
      field('string', $._simple_expression),
      '.',
      optional(field('operator', $.indexing_operator_path)),
      '[',
      field('index', $._sequence_expression),
      ']',
      repeat(field('attribute', $.attribute))
    )),

    bigarray_get_expression: $ => prec.right(PREC.dot, seq(
      field('array', $._simple_expression),
      '.',
      optional(field('operator', $.indexing_operator_path)),
      '{',
      field('index', $._sequence_expression),
      '}',
      repeat(field('attribute', $.attribute))
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
      field('value', $._expression)
    )),

    if_expression: $ => prec.right(PREC.if, seq(
      'if',
      optional($._extension_attribute),
      field('condition', $._sequence_expression),
      field('then', $.then_clause),
      optional(field('else', $.else_clause))
    )),

    then_clause: $ => seq(
      'then',
      field('expression', $._expression)
    ),

    else_clause: $ => seq(
      'else',
      field('expression', $._expression)
    ),

    while_expression: $ => prec.right(seq(
      'while',
      optional($._extension_attribute),
      field('condition', $._sequence_expression),
      field('do', $.do_clause),
      repeat(field('attribute', $.attribute))
    )),

    do_clause: $ => seq(
      'do',
      optional(field('expression', $._sequence_expression)),
      'done'
    ),

    for_expression: $ => prec.right(seq(
      'for',
      optional($._extension_attribute),
      field('name', alias($._value_name, $.value_name)),
      '=',
      field('from', $._sequence_expression),
      choice('to', 'downto'),
      field('to', $._sequence_expression),
      field('do', $.do_clause),
      repeat(field('attribute', $.attribute))
    )),

    sequence_expression: $ => prec.right(PREC.seq, seq(
      field('left', $._expression),
      ';',
      optional(seq(
        optional(seq('%', $.attribute_id)),
        field('right', $._sequence_expression)
      ))
    )),

    match_expression: $ => prec.right(PREC.match, seq(
      choice(
        seq('match', optional($._extension_attribute)),
        field('operator', $.match_operator)
      ),
      field('expression', $._sequence_expression),
      'with',
      $._match_cases,
      repeat(field('attribute', $.attribute))
    )),

    _match_cases: $ => prec.right(seq(
      optional('|'),
      sep1('|', field('case', $.match_case))
    )),

    match_case: $ => seq(
      field('pattern', $._pattern),
      optional(seq('when', field('guard', $._sequence_expression))),
      '->',
      field('expression', choice($._sequence_expression, $.refutation_case))
    ),

    refutation_case: $ => '.',

    function_expression: $ => prec.right(PREC.match, seq(
      'function',
      optional($._extension_attribute),
      $._match_cases,
      repeat(field('attribute', $.attribute))
    )),

    fun_expression: $ => prec.right(PREC.match, seq(
      'fun',
      optional($._extension_attribute),
      repeat1(field('parameter', $._parameter)),
      optional(seq(':', field('type', $._simple_type))),
      '->',
      field('body', $._sequence_expression)
    )),

    try_expression: $ => prec.right(PREC.match, seq(
      'try',
      optional($._extension_attribute),
      field('expression', $._sequence_expression),
      'with',
      $._match_cases,
      repeat(field('attribute', $.attribute))
    )),

    let_expression: $ => prec.right(PREC.match, seq(
      field('definition', $.value_definition),
      'in',
      field('body', $._sequence_expression)
    )),

    coercion_expression: $ => prec.right(seq(
      parenthesize(seq(
        field('expression', $._expression),
        optional(seq(':', field('type', $._type))),
        ':>',
        field('coercion', $._type)
      )),
      repeat(field('attribute', $.attribute))
    )),

    assert_expression: $ => prec.left(PREC.app, seq(
      'assert',
      optional($._extension_attribute),
      field('expression', $._simple_expression)
    )),

    lazy_expression: $ => prec.left(PREC.app, seq(
      'lazy',
      optional($._extension_attribute),
      field('expression', $._simple_expression)
    )),

    let_module_expression: $ => prec.right(PREC.match, seq(
      'let',
      field('definition', $.module_definition),
      'in',
      field('expression', $._sequence_expression)
    )),

    let_open_expression: $ => prec.right(PREC.match, seq(
      'let',
      field('open', $.open_statement),
      'in',
      field('expression', $._sequence_expression)
    )),

    local_open_expression: $ => prec.right(seq(
      field('module', $._module_name),
      '.',
      choice(
        parenthesize(optional(field('expression', $._sequence_expression))),
        field('expression', $.list_expression),
        field('expression', $.array_expression),
        field('expression', $.record_expression),
        field('expression', $.object_copy_expression),
        field('expression', $.local_open_expression)
      ),
      repeat(field('attribute', $.attribute))
    )),

    package_expression: $ => prec.right(seq(
      parenthesize(seq(
        'module',
        optional($._extension_attribute),
        field('module', $._simple_module_expression),
        optional(seq(':', field('type', $._module_type)))
      )),
      repeat(field('attribute', $.attribute))
    )),

    let_exception_expression: $ => prec.right(PREC.match, seq(
      'let',
      field('definition', $.exception_definition),
      'in',
      field('body', $._sequence_expression)
    )),

    new_expression: $ => seq(
      'new',
      optional($._extension_attribute),
      field('class', $.class_path)
    ),

    object_copy_expression: $ => prec.right(seq(
      '{<',
      sep(';', field('variable', $.instance_variable_expression)),
      optional(';'),
      '>}',
      repeat(field('attribute', $.attribute))
    )),

    instance_variable_expression: $ => seq(
      field('name', $._instance_variable_name),
      optional(seq('=', field('value', $._expression)))
    ),

    method_invocation: $ => prec.right(PREC.hash, seq(
      field('object', $._simple_expression),
      '#',
      field('method', $._method_name),
      repeat(field('attribute', $.attribute))
    )),

    object_expression: $ => prec.right(seq(
      'object',
      optional($._extension_attribute),
      optional(parenthesize(seq(
        field('self', $._pattern),
        optional(seq(':', field('self_type', $._type)))
      ))),
      repeat(choice(
        field('field', $._class_field),
        field('floating_attribute', $.floating_attribute)
      )),
      'end',
      repeat(field('attribute', $.attribute))
    )),

    parenthesized_expression: $ => prec.right(seq(
      choice(
        seq(
          'begin',
          optional($._extension_attribute),
          field('expression', $._sequence_expression),
          'end'
        ),
        parenthesize(field('expression', $._sequence_expression))
      ),
      repeat(field('attribute', $.attribute))
    )),

    ocamlyacc_value: $ => prec.right(seq(
      field('name', /\$[0-9]+/),
      repeat(field('attribute', $.attribute))
    )),

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
      $.parenthesized_pattern,
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

    value_name: $ => seq(
      $._value_name,
      repeat(field('attribute', $.attribute))
    ),

    alias_pattern: $ => prec.left(PREC.match, seq(
      field('pattern', $._pattern),
      'as',
      field('name', alias($._value_name, $.value_name)),
      repeat(field('attribute', $.attribute))
    )),

    alias_pattern_no_exn: $ => prec.left(PREC.match, seq(
      field('pattern', $._pattern_no_exn),
      'as',
      field('name', alias($._value_name, $.value_name)),
      repeat(field('attribute', $.attribute))
    )),

    typed_pattern: $ => seq(
      parenthesize(seq(
        field('pattern', $._pattern),
        ':',
        field('type', $._type)
      )),
      repeat(field('attribute', $.attribute))
    ),

    or_pattern: $ => prec.left(PREC.seq, seq(
      field('left', $._pattern),
      '|',
      field('right', $._pattern)
    )),

    or_pattern_no_exn: $ => prec.left(PREC.seq, seq(
      field('left', $._pattern_no_exn),
      '|',
      field('right', $._pattern)
    )),

    constructor_pattern: $ => prec.right(PREC.app, seq(
      field('constructor', alias($._constructor_path, $.constructor_path)),
      field('pattern', $._pattern)
    )),

    tag_pattern: $ => prec.right(PREC.app, seq(
      field('tag', $.tag),
      field('pattern', $._pattern)
    )),

    polymorphic_variant_pattern: $ => seq(
      '#',
      field('polymorphic_variant', $.type_constructor_path)
    ),

    tuple_pattern: $ => prec.left(PREC.prod, seq(
      field('left', $._pattern),
      ',',
      field('right', $._pattern)
    )),

    tuple_pattern_no_exn: $ => prec.left(PREC.prod, seq(
      field('left', $._pattern_no_exn),
      ',',
      field('right', $._pattern)
    )),

    record_pattern: $ => prec.left(seq(
      '{',
      sep1(';', field('field', $.field_pattern)),
      optional(seq(';', '_')),
      optional(';'),
      '}',
      repeat(field('attribute', $.attribute))
    )),

    field_pattern: $ => seq(
      field('name', $.field_path),
      optional(seq(':', field('type', $._type))),
      optional(seq('=', field('pattern', $._pattern)))
    ),

    list_pattern: $ => prec.left(seq(
      '[',
      optional(seq(
        sep1(';', field('item', $._pattern)),
        optional(';')
      )),
      ']',
      repeat(field('attribute', $.attribute))
    )),

    cons_pattern: $ => prec.right(PREC.cons, seq(
      field('left', $._pattern),
      '::',
      field('right', $._pattern)
    )),

    cons_pattern_no_exn: $ => prec.right(PREC.cons, seq(
      field('left', $._pattern_no_exn),
      '::',
      field('right', $._pattern)
    )),

    array_pattern: $ => prec.left(seq(
      '[|',
      optional(seq(
        sep1(';', field('item', $._pattern)),
        optional(';')
      )),
      '|]',
      repeat(field('attribute', $.attribute))
    )),

    range_pattern: $ => prec(PREC.dot, seq(
      field('left', $._signed_constant),
      '..',
      field('right', $._signed_constant)
    )),

    lazy_pattern: $ => prec(PREC.hash, seq(
      'lazy',
      optional($._extension_attribute),
      field('pattern', $._pattern)
    )),

    local_open_pattern: $ => prec.left(seq(
      field('module', $._module_name),
      '.',
      choice(
        parenthesize(optional(field('pattern', $._pattern))),
        field('pattern', $.list_pattern),
        field('pattern', $.array_pattern),
        field('pattern', $.record_pattern),
        field('pattern', $.local_open_pattern)
      ),
      repeat(field('attribute', $.attribute))
    )),

    package_pattern: $ => seq(
      parenthesize(seq(
        'module',
        optional($._extension_attribute),
        field('module', choice($._module_name, alias('_', $.module_name))),
        optional(seq(':', field('type', $._module_type)))
      )),
      repeat(field('attribute', $.attribute))
    ),

    parenthesized_pattern: $ => seq(
      parenthesize(field('pattern', $._pattern)),
      repeat(field('attribute', $.attribute))
    ),

    exception_pattern: $ => seq(
      'exception',
      optional($._extension_attribute),
      field('pattern', $._pattern)
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
      seq(':', choice(field('type', $._type), $._specifications)),
      seq(
        '?',
        field('pattern', $._pattern),
        optional(seq('when', field('guard', $._sequence_expression)))
      )
    ),

    _extension: $ => choice(
      $.extension,
      $.quoted_extension
    ),

    extension: $ => prec.right(seq(
      '[%',
      field('id', $.attribute_id),
      optional(field('payload', $.attribute_payload)),
      ']',
      repeat(field('attribute', $.attribute))
    )),

    quoted_extension: $ => prec.right(seq(
      '{%',
      $.attribute_id,
      optional(/\s+/),
      $._quoted_string,
      '}',
      repeat($.attribute)
    )),

    _item_extension: $ => choice(
      $.item_extension,
      $.quoted_item_extension
    ),

    item_extension: $ => prec.right(seq(
      '[%%',
      field('id', $.attribute_id),
      optional(field('payload', $.attribute_payload)),
      ']',
      repeat(field('item_attribute', $.item_attribute))
    )),

    quoted_item_extension: $ => prec.right(seq(
      '{%%',
      $.attribute_id,
      optional(/\s+/),
      $._quoted_string,
      '}',
      repeat($.item_attribute)
    )),

    _extension_attribute: $ => prec.right(choice(
      seq('%', field('attribute_id', $.attribute_id)),
      field('attribute', $.attribute),
      seq($._extension_attribute, field('attribute', repeat1($.attribute)))
    )),

    // Constants

    constant: $ => prec.right(seq(
      choice(
        $.number,
        $.character,
        $.string,
        $.quoted_string,
        $.boolean,
        $.unit
      ),
      repeat(field('attribute', $.attribute))
    )),

    _signed_constant: $ => choice(
      $.constant,
      alias($.signed_number, $.constant)
    ),

    number: $ => NUMBER,

    signed_number: $ => seq(
      choice('+', '-'),
      $.number,
      repeat(field('attribute', $.attribute))
    ),

    character: $ => seq(
      "'",
      choice(
        /[^\\']/,
        field('escape', $.escape_sequence)
      ),
      "'"
    ),

    string: $ => seq(
      '"',
      repeat(choice(
        token.immediate('(*'),
        /[^\\"%@]+|%|@/,
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

    _value_name: $ => choice(
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

    _value_path: $ => choice(
      field('name', alias($._value_name, $.value_name)),
      seq(
        field('module', $._module_name),
        '.',
        field('path', alias($._value_path, $.value_path))
      )
    ),

    _module_type_path: $ => choice(
      field('name', $._module_type_name),
      seq(
        field('module', $._simple_module_expression),
        '.',
        field('name', $._module_type_name)
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

    _constructor_path: $ => prec.right(choice(
      field('name', $._constructor_name),
      seq(
        field('module', $._module_name),
        '.',
        field('path', alias($._constructor_path, $.constructor_path))
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

    _type_constructor_path: $ => choice(
      field('name', $._type_constructor),
      seq(
        $._extended_module_name,
        '.',
        field('path', alias($._type_constructor_path, $.type_constructor_path))
      )
    ),

    _class_type_path: $ => prec(1, choice(
      field('name', $._class_name),
      seq(
        $._extended_module_name,
        '.',
        field('path', alias($._class_type_path, $.class_type_path))
      )
    )),

    _class_path: $ => choice(
      field('name', $._class_name),
      seq(
        $._module_name,
        '.',
        field('path', alias($._class_path, $.class_path))
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
    _type_variable: $ => seq("'", choice($._identifier, $._capitalized_identifier)),
    _tag: $ => seq('`', choice($._identifier, $._capitalized_identifier)),
    attribute_id: $ => sep1('.', choice($._identifier, $._capitalized_identifier)),

    // Comments

    _comment: COMMENT,

    comment: COMMENT
  },

  conflicts: $ => [
    [$._module_type, $._simple_module_expression],
    [$.module_name, $._module_type_path],
    [$._simple_class_type, $._simple_type]
  ],

  externals: $ => [
    $._quoted_string,
    $.line_number_directive
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
