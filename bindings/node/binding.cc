#include <napi.h>

typedef struct TSLanguage TSLanguage;

extern "C" TSLanguage *tree_sitter_ocaml();
extern "C" TSLanguage *tree_sitter_ocaml_interface();

// "tree-sitter", "language" hashed with BLAKE2
const napi_type_tag LANGUAGE_TYPE_TAG = {
  0x8AF2E5212AD58ABF, 0xD5006CAD83ABBA16
};

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    auto ocaml_exports = Napi::Object::New(env);
    ocaml_exports["name"] = Napi::String::New(env, "ocaml");
    auto ocaml_language = Napi::External<TSLanguage>::New(env, tree_sitter_ocaml());
    ocaml_language.TypeTag(&LANGUAGE_TYPE_TAG);
    ocaml_exports["language"] = ocaml_language;
    exports["ocaml"] = ocaml_exports;

    auto interface_exports = Napi::Object::New(env);
    interface_exports["name"] = Napi::String::New(env, "ocaml_interface");
    auto interface_language = Napi::External<TSLanguage>::New(env, tree_sitter_ocaml_interface());
    interface_language.TypeTag(&LANGUAGE_TYPE_TAG);
    interface_exports["language"] = interface_language;
    exports["interface"] = interface_exports;

    return exports;
}

NODE_API_MODULE(tree_sitter_ocaml_binding, Init)
