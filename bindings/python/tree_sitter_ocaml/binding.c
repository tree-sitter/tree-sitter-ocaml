#include <Python.h>

typedef struct TSLanguage TSLanguage;

TSLanguage *tree_sitter_ocaml(void);
TSLanguage *tree_sitter_ocaml_interface(void);
TSLanguage *tree_sitter_ocaml_type(void);

static PyObject* _binding_language_ocaml(PyObject *Py_UNUSED(self), PyObject *Py_UNUSED(args)) {
    return PyCapsule_New(tree_sitter_ocaml(), "tree_sitter.Language", NULL);
}

static PyObject* _binding_language_ocaml_interface(PyObject *Py_UNUSED(self), PyObject *Py_UNUSED(args)) {
    return PyCapsule_New(tree_sitter_ocaml_interface(), "tree_sitter.Language", NULL);
}

static PyObject* _binding_language_ocaml_type(PyObject *Py_UNUSED(self), PyObject *Py_UNUSED(args)) {
    return PyCapsule_New(tree_sitter_ocaml_type(), "tree_sitter.Language", NULL);
}

static PyMethodDef methods[] = {
    {"language_ocaml", _binding_language_ocaml, METH_NOARGS,
     "Get the tree-sitter language for OCaml."},
    {"language_ocaml_interface", _binding_language_ocaml_interface, METH_NOARGS,
     "Get the tree-sitter language for OCaml interfaces."},
    {"language_ocaml_type", _binding_language_ocaml_type, METH_NOARGS,
     "Get the tree-sitter language for OCaml types."},
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
