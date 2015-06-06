
all: build
	@echo
	@echo "Try: make test"

build:
	$(MAKE) -C dotnet all
	$(MAKE) -C cpp all
	$(MAKE) -C c all

runtests: build
	$(MAKE) -C sh runtests
	$(MAKE) -C python runtests
	$(MAKE) -C dotnet runtests
	$(MAKE) -C cpp runtests
	$(MAKE) -C c runtests
	$(MAKE) -C javascript runtests


test: build
	./wvtestrun $(MAKE) runtests

clean::
	rm -f *~ .*~
	$(MAKE) -C sh clean
	$(MAKE) -C python clean
	$(MAKE) -C dotnet clean
	$(MAKE) -C cpp clean
	$(MAKE) -C c clean
