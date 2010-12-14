
all: t/wvtest

t/wvtest: wvtestmain.c wvtest.c t/wvtest.t.c
	gcc -D WVTEST_CONFIGURED -o $@ -I. $^

runtests: all
	t/wvtest

test: all
	../wvtestrun $(MAKE) runtests

clean::
	rm -f *~ t/*~ *.o t/*.o t/wvtest
