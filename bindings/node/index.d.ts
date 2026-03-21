type BaseNode = {
  type: string;
  named: boolean;
};

type ChildNode = {
  multiple: boolean;
  required: boolean;
  types: BaseNode[];
};

type NodeInfo =
  | (BaseNode & {
      subtypes: BaseNode[];
    })
  | (BaseNode & {
      fields: { [name: string]: ChildNode };
      children: ChildNode[];
    });

/**
 * The tree-sitter language object for OCaml.
 *
 * @see {@linkcode https://tree-sitter.github.io/node-tree-sitter/interfaces/Parser.Language.html Parser.Language}
 */
type Language = {
  name: string;

  /**
   * The inner language object.
   * @private
   */
  language: unknown;

  /**
   * The content of the `node-types.json` file.
   *
   * @see {@linkplain https://tree-sitter.github.io/tree-sitter/using-parsers/6-static-node-types Static Node Types}
   */
  nodeTypeInfo: NodeInfo[];
};

/**
 * The tree-sitter language object for OCaml.
 *
 * @see {@linkcode https://tree-sitter.github.io/node-tree-sitter/interfaces/Parser.Language.html Parser.Language}
 */
export const ocaml: Language;

/**
 * The tree-sitter language object for OCaml interfaces.
 *
 * @see {@linkcode https://tree-sitter.github.io/node-tree-sitter/interfaces/Parser.Language.html Parser.Language}
 */
export const ocaml_interface: Language;

/**
 * The tree-sitter language object for OCaml types.
 *
 * @see {@linkcode https://tree-sitter.github.io/node-tree-sitter/interfaces/Parser.Language.html Parser.Language}
 */
export const ocaml_type: Language;

/** The syntax highlighting query for OCaml. */
export const HIGHLIGHTS_QUERY: string;

/** The local variable query for OCaml. */
export const LOCALS_QUERY: string;

/** The symbol tagging query for OCaml. */
export const TAGS_QUERY: string;
