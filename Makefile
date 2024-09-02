TS ?= tree-sitter

all install uninstall clean:
	$(MAKE) -C grammars/ocaml $@
	$(MAKE) -C grammars/interface $@
	$(MAKE) -C grammars/type $@

test:
	$(TS) test
	$(TS) parse examples/* --quiet --time

generate:
	cd grammars/ocaml && $(TS) generate --no-bindings
	cd grammars/interface && $(TS) generate --no-bindings
	cd grammars/type && $(TS) generate --no-bindings

.PHONY: all install uninstall clean test update generate
