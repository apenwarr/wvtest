
DIRS=sh python dotnet cpp c javascript

all: build
	@echo
	@echo "Try: make test"

build:
	set -e; for d in $(DIRS); do \
		if [ "$$d" = "dotnet" ] && ! runnable gmcs; then continue; fi; \
		$(MAKE) -C $$d all; \
	done

runtests: build
	set -e; for d in $(DIRS); do \
		if [ "$$d" = "dotnet" ] && ! runnable gmcs; then continue; fi; \
		$(MAKE) -C $$d runtests; \
	done


test: build
	./wvtestrun $(MAKE) runtests

clean::
	rm -f *~ .*~
	set -e; for d in $(DIRS); do \
		$(MAKE) -C $$d clean; \
	done
