/// <reference types="node" />

const assert = require("node:assert");
const { describe, it } = require("node:test");

const Parser = require("tree-sitter");
const { ocaml, ocaml_interface, ocaml_type } = require("../..");

describe("OCaml", () => {
  const parser = new Parser();
  parser.setLanguage(ocaml);

  it("should be named ocaml", () => {
    assert.strictEqual(parser.getLanguage().name, "ocaml");
  });

  it("should parse source code", () => {
    const sourceCode = `
    module M = struct
      let x = 0
    end
    `;
    const tree = parser.parse(sourceCode);
    assert(!tree.rootNode.hasError);
  });
});

describe("OCamlInterface", () => {
  const parser = new Parser();
  parser.setLanguage(ocaml_interface);

  it("should be named ocaml_interface", () => {
    assert.strictEqual(parser.getLanguage().name, "ocaml_interface");
  });

  it("should parse source code", () => {
    const sourceCode = `
    module M : sig
      val x : int
    end
    `;
    const tree = parser.parse(sourceCode);
    assert(!tree.rootNode.hasError);
  });
});

describe("OCamlType", () => {
  const parser = new Parser();
  parser.setLanguage(ocaml_type);

  it("should be named ocaml_type", () => {
    assert.strictEqual(parser.getLanguage().name, "ocaml_type");
  });

  it("should parse source code", () => {
    const sourceCode = `
    int list
    `;
    const tree = parser.parse(sourceCode);
    assert(!tree.rootNode.hasError);
  });
});
