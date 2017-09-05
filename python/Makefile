
all:
	@echo "Try: make test"

runtests:
	./wvtest.py \
		$(patsubst ./%t,%t/*.py,$(shell find . -type d -name t)) \
		basedir_test.py
	python t/twvtest.py
	python basedir_test.py

test:
	../wvtestrun $(MAKE) runtests

clean::
	rm -f *~ t/*~ *.pyc t/*.pyc