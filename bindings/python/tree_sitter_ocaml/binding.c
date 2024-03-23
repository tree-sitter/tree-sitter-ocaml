#include <Python.h>

typedef struct TSLanguage TSLanguage;

TSLanguage *tree_sitter_ocaml(void);
TSLanguage *tree_sitter_ocaml_interface(void);

static PyObject* _binding_language_ocaml(PyObject *self, PyObject *args) {
    return PyLong_FromVoidPtr(tree_sitter_ocaml());
}

static PyObject* _binding_language_ocaml_interface(PyObject *self, PyObject *args) {
    return PyLong_FromVoidPtr(tree_sitter_ocaml_interface());
}

static PyMethodDef methods[] = {
    {"ocaml", _binding_language_ocaml, METH_NOARGS,
     "Get the tree-sitter language for OCaml."},
    {"interface", _binding_language_ocaml_interface, METH_NOARGS,
     "Get the tree-sitter language for OCaml interfaces."},
    {NULL, NULL, 0, NULL}
};

static struct PyModuleDef module = {
    .m_base = PyModuleDef_HEAD_INIT,
    .m_name = "_binding",
    .m_doc = NULL,
    .m_size = -1,
    .m_methods = methods
};

PyMODINIT_FUNC PyInit__binding(void) {
    return PyModule_Create(&module);
}
