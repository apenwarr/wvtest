all:
	@echo "Try: make test"
	@false
	
include wvtestrules.mk

CPPFLAGS=-I.

t/test.exe: wvtest.cs wvtestmain.cs t/wvtest.t.cs.E
	gmcs /out:$@ /debug $^

runtests: t/test.exe
	cd t && mono --debug test.exe
	
test:
	../wvtestrunner $(MAKE) runtests

clean::
	rm -f *~ t/*~ .*~ *.E t/*.E *.d t/*.d t/*.exe t/*.mdb

