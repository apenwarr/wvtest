
all:
	@echo "Try: make test"
	@false

runtests:
	python wvtestmain.py \
		$(patsubst ./%t,%t/*.py,$(shell find -type d -name t))

test:
	../wvtestrunner.pl $(MAKE) runtests
