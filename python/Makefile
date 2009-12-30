
all:
	@echo "Try: make test"
	@false

runtests:
	./wvtest.py \
		$(patsubst ./%t,%t/*.py,$(shell find -type d -name t))

test:
	../wvtestrun $(MAKE) runtests

clean::
	rm -f *~ t/*~ *.pyc t/*.pyc