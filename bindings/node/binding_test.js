const assert = require("node:assert/strict");
const { describe, it } = require("node:test");

const Parser = require("tree-sitter");
const { ocaml: OCaml, interface: OCamlInterface } = require("../..");

describe("OCaml language", () => {
  const parser = new Parser();
  parser.setLanguage(OCaml);

  it("should be named ocaml", () => {
    assert.strictEqual(parser.getLanguage().name, "ocaml");
  });

  it("should parse sourcecode", () => {
    const sourceCode = `
    module M = struct
      let x = 0
    end
    `;
    const tree = parser.parse(sourceCode);
    assert(!tree.rootNode.hasError);
  });
});

describe("OCamlInterface language", () => {
  const parser = new Parser();
  parser.setLanguage(OCamlInterface);

  it("should be named ocaml_interface", () => {
    assert.strictEqual(parser.getLanguage().name, "ocaml_interface");
  });

  it("should parse sourcecode", () => {
    const sourceCode = `
    module M : sig
      val x : int
    end
    `;
    const tree = parser.parse(sourceCode);
    assert(!tree.rootNode.hasError);
  });
});
