TS ?= tree-sitter

all install uninstall clean:
	$(MAKE) -C grammars/ocaml $@
	$(MAKE) -C grammars/interface $@
	$(MAKE) -C grammars/type $@

test:
	$(TS) test
	$(TS) parse examples/* --quiet --time

generate:
	cd grammars/ocaml && $(TS) generate
	cd grammars/interface && $(TS) generate
	cd grammars/type && $(TS) generate

.PHONY: all install uninstall clean test update generate
