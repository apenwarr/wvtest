
all:
	@echo "There's nothing to build here except the tests."
	@echo
	@echo "Try: make test"
	
runtests:
	make -C python runtests
	make -C dotnet runtests
	
test:
	./wvtestrunner.pl $(MAKE) runtests
