import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));

const binding = typeof process.versions.bun === 'string' ?
  await import(`${root}/prebuilds/${process.platform}-${process.arch}/tree-sitter-ocaml.node`) :
  (await import('node-gyp-build')).default(root);

try {
  const ocamlNodeTypes = await import(`${root}/grammars/ocaml/src/node-types.json`, {with: {type: 'json'}});
  const ocamlInterfaceNodeTypes = await import(`${root}/grammars/interface/src/node-types.json`, {with: {type: 'json'}});
  const ocamlTypeNodeTypes = await import(`${root}/grammars/type/src/node-types.json`, {with: {type: 'json'}});

  binding.ocaml.nodeTypeInfo = ocamlNodeTypes.default;
  binding.ocaml_interface.nodeTypeInfo = ocamlInterfaceNodeTypes.default;
  binding.ocaml_type.nodeTypeInfo = ocamlTypeNodeTypes.default;
} catch { }


export const ocaml = binding.ocaml;
export const ocaml_interface = binding.ocaml_interface;
export const ocaml_type = binding.ocaml_type;

export const HIGHLIGHTS_QUERY = readFileSync(`${root}/queries/highlights.scm`, 'utf8');
export const LOCALS_QUERY = readFileSync(`${root}/queries/locals.scm`, 'utf8');
export const TAGS_QUERY = readFileSync(`${root}/queries/tags.scm`, 'utf8');
