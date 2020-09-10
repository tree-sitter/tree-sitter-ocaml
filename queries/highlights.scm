; Modules
;--------

[(module_name) (module_type_name)] @constructor

; Types
;------

(
  (type_constructor) @type.builtin
  (#match? @type.builtin "^(int|char|bytes|string|float|bool|unit|exn|array|list|option|int32|int64|nativeint|format6|lazy_t)$")
)

[(class_name) (class_type_name) (type_constructor)] @type

[(constructor_name) (tag)] @tag

; Functions
;----------

(
  (value_name) @function.builtin
  (#match? @function.builtin "^(raise(_notrace)?|failwith|invalid_arg)$")
)

(let_binding
  pattern: (value_pattern) @function
  (parameter))

(let_binding
  pattern: (value_pattern) @function
  body: [(fun_expression) (function_expression)])

(value_specification (value_name) @function)

(external (value_pattern) @function)

(application_expression
  function: (value_path (value_name)) @function)

(infix_expression
  left: (value_path (value_name) @function)
  (infix_operator) @operator
  (#eq? @operator "@@"))

(infix_expression
  (infix_operator) @operator
  right: (value_path (value_name) @function)
  (#eq? @operator "|>"))

(method_name) @function.method

; Variables
;----------

[(value_name) (type_variable)] @variable

(let_binding pattern: (value_pattern) @variable)

(value_pattern) @variable.parameter

; Properties
;-----------

[(label_name) (field_name) (instance_variable_name)] @property

; Constants
;----------

[(unit) (boolean)] @constant

(number) @number

[(string) (quoted_string) (character)] @string

(escape_sequence) @escape

(conversion_specification) @string.special

; Operators
;----------

[(prefix_operator) (infix_operator) (indexing_operator)] @operator

["*" "#" "::" "<-"] @operator

; Keywords
;---------

(match_expression (match_operator) @keyword)

(value_definition [(let_operator) (and_operator)] @keyword)

[
  "and"
  "as"
  "assert"
  "begin"
  "class"
  "constraint"
  "do"
  "done"
  "downto"
  "else"
  "end"
  "exception"
  "external"
  "for"
  "fun"
  "function"
  "functor"
  "if"
  "in"
  "include"
  "inherit"
  "initializer"
  "lazy"
  "let"
  "match"
  "method"
  "module"
  "mutable"
  "new"
  "nonrec"
  "object"
  "of"
  "open"
  "private"
  "rec"
  "sig"
  "struct"
  "then"
  "to"
  "try"
  "type"
  "val"
  "virtual"
  "when"
  "while"
  "with"
] @keyword

; Punctuation
;------------

["(" ")" "[" "]" "{" "}" "[|" "|]" "[<" "[>"] @punctuation.bracket

(object_type ["<" ">"] @punctuation.bracket)

[
  "," "." ";" ":" "=" "|" "~" "?" "+" "-" "!" "%" ">"
  "->" ";;" ":>" "+=" ":=" ".."
] @punctuation.delimiter

(attribute ["[@" "]"] @punctuation.special)
(item_attribute ["[@@" "]"] @punctuation.special)
(floating_attribute ["[@@@" "]"] @punctuation.special)
(extension ["[%" "]"] @punctuation.special)
(item_extension ["[%%" "]"] @punctuation.special)
(quoted_extension ["{%" "}"] @punctuation.special)
(quoted_item_extension ["{%%" "}"] @punctuation.special)

"%" @punctuation.special

; Attributes
;-----------

(attribute_id) @attribute

; Comments
;---------

[(comment) (line_number_directive) (directive) (shebang)] @comment
