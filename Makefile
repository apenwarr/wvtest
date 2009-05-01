
all:
	@echo "There's nothing to build here except the tests."
	@echo
	@echo "Try: make test"
	
runtests:
	make -C python runtests
	make -C dotnet runtests
	make -C cpp runtests
	
test:
	./wvtestrun $(MAKE) runtests

clean::
	rm -f *~ .*~
	make -C python clean
	make -C dotnet clean
	make -C cpp clean
