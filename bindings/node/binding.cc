#include <napi.h>

typedef struct TSLanguage TSLanguage;

extern "C" TSLanguage *tree_sitter_ocaml();
extern "C" TSLanguage *tree_sitter_ocaml_interface();
extern "C" TSLanguage *tree_sitter_ocaml_type();

// "tree-sitter", "language" hashed with BLAKE2
const napi_type_tag LANGUAGE_TYPE_TAG = {
    0x8AF2E5212AD58ABF, 0xD5006CAD83ABBA16
};

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    auto ocaml = Napi::Object::New(env);
    ocaml["name"] = Napi::String::New(env, "ocaml");
    auto ocaml_language = Napi::External<TSLanguage>::New(env, tree_sitter_ocaml());
    ocaml_language.TypeTag(&LANGUAGE_TYPE_TAG);
    ocaml["language"] = ocaml_language;

    auto ocaml_interface = Napi::Object::New(env);
    ocaml_interface["name"] = Napi::String::New(env, "ocaml_interface");
    auto ocaml_interface_language = Napi::External<TSLanguage>::New(env, tree_sitter_ocaml_interface());
    ocaml_interface_language.TypeTag(&LANGUAGE_TYPE_TAG);
    ocaml_interface["language"] = ocaml_interface_language;

    auto ocaml_type = Napi::Object::New(env);
    ocaml_type["name"] = Napi::String::New(env, "ocaml_type");
    auto ocaml_type_language = Napi::External<TSLanguage>::New(env, tree_sitter_ocaml_type());
    ocaml_type_language.TypeTag(&LANGUAGE_TYPE_TAG);
    ocaml_type["language"] = ocaml_type_language;

    exports["ocaml"] = ocaml;
    exports["ocaml_interface"] = ocaml_interface;
    exports["ocaml_type"] = ocaml_type;
    return exports;
}

NODE_API_MODULE(tree_sitter_ocaml_binding, Init)
