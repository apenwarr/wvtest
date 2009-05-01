default: all

SHELL=/bin/bash

# cc -E tries to guess by extension what to do with the file.
# And it does other weird things. cpp seems to Just Work(tm), so use that for
# our C# (.cs) files
CSCPP=cpp

# Cygwin supports symlinks, but they aren't actually useful outside cygwin,
# so let's just copy instead.  We also use Microsoft's .net compiler instead
# of mono.
ifeq ($(OS),Windows_NT)
  CSC?=csc
  SYMLINK=cp
  MONORUN=
else
  CSC?=gmcs -langversion:linq
  SYMLINK=ln -sf
  PKGS += /r:Mono.Posix
  MONORUN=mono --debug
endif

CSFLAGS=/warn:4 /debug
#CSFLAGS += /warnaserror

TESTRUNNER=$(WVDOTNET)/wvtestrunner.pl

# Rules for generating autodependencies on header files
$(patsubst %.cs.E,%.d,$(filter %.cs.E,$(FILES))): %.d: %.cs
	@echo Generating dependency file $@ for $<
	@set -e; set -o pipefail; rm -f $@; (\
	    ($(CSCPP) -M -MM -MQ '$@' $(CPPFLAGS) $< && echo Makefile) \
		| paste -s -d ' ' - && \
	    $(CSCPP) -M -MM -MQ '$<'.E $(CPPFLAGS) $< \
	) > $@ \
	|| (rm -f $@ && echo "Error generating dependency file." && exit 1)

include $(patsubst %.cs.E,%.d,$(filter %.cs.E,$(FILES)))

# Rule for actually preprocessing source files with headers
%.cs.E: %.cs
	@rm -f $@
	set -o pipefail; $(CSCPP) $(CPPFLAGS) -C -dI $< \
		| expand -8 \
		| sed -e 's,^#include,//#include,' \
		| grep -v '^# [0-9]' \
		>$@ || (rm -f $@ && exit 1)


define csbuild
	@for d in $(filter ../%.dll,$^); do \
		rm -f $$(basename $$d); \
		$(SYMLINK) -v $$d .; \
	done
	$(CSC) $(CSFLAGS) /target:$1 /out:$@ \
		$(PKGS) \
		$(filter %.cs.E %.cs,$^) \
		$(patsubst %.dll,/r:%.dll,$(filter %.dll,$^))
endef


%.dll: assemblyinfo.cs
	$(call csbuild,library)

# This must come before the %.cs rule, since %.cs.E files are better.
%.exe: %.cs.E
	$(call csbuild,exe)

%.exe: %.cs
	$(call csbuild,exe)

%: %.exe
	rm -f $@
	$(SYMLINK) $< $@

%.pass: %.exe
	rm -f $@
	$(TESTRUNNER) $(MONORUN) ./$^
	touch $@

clean::
	rm -f *~ *.E *.d *.exe *.dll *.mdb *.pdb
