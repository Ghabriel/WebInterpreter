# Copyright 2017 Ghabriel Nunes <ghabriel.nunes@gmail.com>

# Folders
CSS          :=css
JS           :=js
LIB          :=lib
TS           :=scripts
GRAMMAR      :=grammar

# Filenames
INDEX        :=index.html
LIBSFILE     :=libs.txt
JSBASE       :=base.js
JSCOMPRESSED :=main.js
SCANNER      :=scanner.jisonlex
PARSER       :=parser.jison
GRAMMARNAME  :=grammar.js
COMPRESS     :=1

# Misc.
ORIGNAMES    :=$(shell cat $(LIBSFILE) | sed "s/^\([^:]\+\): \(.*\)/\1/")
LIBNAMES     :=$(patsubst %, $(LIB)/%, $(ORIGNAMES))
TSFILES      :=$(wildcard $(TS)/*.ts)
GJS          :=$(GRAMMAR)/$(GRAMMARNAME)

.PHONY: all dirs libs disable_compress raw simple

all: dirs libs
	@echo "[ grammar ] $(GJS)"
	@jison $(GRAMMAR)/$(PARSER) $(GRAMMAR)/$(SCANNER) -o $(GJS)

	@echo "[.ts ⟶ .js]"
ifneq ("$(TSFILES)", "")
	@tsc --removeComments --noImplicitReturns --module amd --outFile $(JS)/$(JSBASE) $(TSFILES)
else
	@touch $(JS)/$(JSBASE)
	@cat /dev/null > $(JS)/$(JSBASE)
endif

	@sed -e'/^var grammar/a var program = new ProgramWrapper(); var Actions = ActionsWrapper;' $(GJS) \
	| sed 's/^var grammar/Grammar.grammar/' \
	| head -n -18 > temp

	@cat $(JS)/$(JSBASE) | grep -Pzo '(?s).*\(function \(Grammar\) \{' > temp_before
	@cat $(JS)/$(JSBASE) | grep -Pzo '(?s)\}\)\(Grammar = exports\.Grammar \|\| \(exports\.Grammar = \{\}\)\);.*' > temp_after
	@cat temp_before temp temp_after > $(JS)/$(JSBASE)
	@rm temp_before temp temp_after

	@if [ "$(COMPRESS)" = "1" ]; then \
		echo "[minifying] $(JS)/$(JSBASE) ⟶ $(JS)/$(JSCOMPRESSED)";\
		uglifyjs $(JS)/$(JSBASE) --compress --mangle > $(JS)/$(JSCOMPRESSED) 2> /dev/null;\
	else\
		echo "[ copying ] $(JS)/$(JSBASE) ⟶ $(JS)/$(JSCOMPRESSED)";\
		cp $(JS)/$(JSBASE) $(JS)/$(JSCOMPRESSED);\
	fi

dirs: | $(CSS) $(JS) $(TS) $(GRAMMAR) $(INDEX)

libs: | $(LIBNAMES)

disable_compress:
	$(eval COMPRESS :=0)

raw: disable_compress all

simple:
	@tsc --module amd --outFile $(JS)/$(JSBASE) $(TSFILES)
	@cp $(JS)/$(JSBASE) $(JS)/$(JSCOMPRESSED)

$(CSS) $(JS) $(LIB) $(TS) $(GRAMMAR):
	@echo "[  mkdir  ] $@"
	@mkdir -p $@

$(INDEX):
	@echo "[  index  ] $@"
	@touch $(INDEX)

$(LIBNAMES):
	$(eval PURENAME=$(patsubst $(LIB)/%, %, $@))
	$(eval URL=$(shell cat $(LIBSFILE) | grep "^$(PURENAME):" | sed "s/^\([^:]\+\): \(.*\)/\2/"))
	@echo "[   lib   ] $(PURENAME)"
	@touch $@
	@wget -O $@ -q $(URL)
