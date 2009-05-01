
all:
	@echo "Try: make test"
	@false

test:
	../wvtestrunner.pl python wvtestmain.py \
		$(patsubst ./%t,%t/*.py,$(shell find -type d -name t))

