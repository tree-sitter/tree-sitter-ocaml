const root = require("path").join(__dirname, "..", "..");

module.exports = require("node-gyp-build")(root);

try {
  module.exports.ocaml.nodeTypeInfo = require("../../grammars/ocaml/src/node-types.json");
  module.exports.ocaml_interface.nodeTypeInfo = require("../../grammars/interface/src/node-types.json");
  module.exports.ocaml_type.nodeTypeInfo = require("../../grammars/type/src/node-types.json");
} catch (_) { }
