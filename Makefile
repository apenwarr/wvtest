
all: build
	@echo
	@echo "Try: make test"
	
build:
	$(MAKE) -C dotnet all
	$(MAKE) -C cpp all
	
runtests: build
	$(MAKE) -C sh runtests
	$(MAKE) -C python runtests
	$(MAKE) -C dotnet runtests
	$(MAKE) -C cpp runtests
	
	
test: build
	./wvtestrun $(MAKE) runtests

clean::
	rm -f *~ .*~
	$(MAKE) -C sh clean
	$(MAKE) -C python clean
	$(MAKE) -C dotnet clean
	$(MAKE) -C cpp clean
