#include <Python.h>

typedef struct TSLanguage TSLanguage;

TSLanguage *tree_sitter_ocaml(void);
TSLanguage *tree_sitter_ocaml_interface(void);
TSLanguage *tree_sitter_ocaml_type(void);

static PyObject* _binding_language_ocaml(PyObject *Py_UNUSED(self), PyObject *Py_UNUSED(args)) {
    return PyLong_FromVoidPtr(tree_sitter_ocaml());
}

static PyObject* _binding_language_ocaml_interface(PyObject *Py_UNUSED(self), PyObject *Py_UNUSED(args)) {
    return PyLong_FromVoidPtr(tree_sitter_ocaml_interface());
}

static PyObject* _binding_language_ocaml_type(PyObject *Py_UNUSED(self), PyObject *Py_UNUSED(args)) {
    return PyLong_FromVoidPtr(tree_sitter_ocaml_type());
}

static PyMethodDef methods[] = {
    {"ocaml", _binding_language_ocaml, METH_NOARGS,
     "Get the tree-sitter language for OCaml."},
    {"interface", _binding_language_ocaml_interface, METH_NOARGS,
     "Get the tree-sitter language for OCaml interfaces."},
    {"type", _binding_language_ocaml_type, METH_NOARGS,
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
