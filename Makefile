
all:
	@echo "There's nothing to build here, really."
	@echo
	@echo "Try: make test"
	
runtests:
	make -C python test
	
test:
	./wvtestrunner.pl $(MAKE) runtests
