
all:
	@echo "Try: make test"
	@false
	
t/wvtest: wvtestmain.cc wvtest.cc t/wvtest.t.cc
	g++ -D WVTEST_CONFIGURED -o $@ -I. $^
	
runtests: t/wvtest
	t/wvtest

test:
	../wvtestrunner.pl $(MAKE) runtests
	
clean::
	rm -f *~ *.o t/*.o t/wvtest
