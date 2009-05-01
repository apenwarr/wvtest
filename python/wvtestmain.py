#!/usr/bin/python
import wvtest
import sys, imp, types, os, os.path
import traceback

def runtest(modname, fname, f):
    print
    print 'Testing "%s" in %s.py:' % (fname, modname)
    try:
        f()
    except Exception, e:
        print
        print traceback.format_exc()
        tb = sys.exc_info()[2]
        wvtest._result(e, traceback.extract_tb(tb)[-1],
                       'EXCEPTION')

for modname in sys.argv[1:]:
    if modname.endswith('.py'):
        modname = modname[:-3]
    print
    print 'Importing: %s' % modname
    wvtest._registered = []
    mod = __import__(modname, None, None, [])

    for t in wvtest._registered:
	runtest(modname, t.func_name, t)
                        
print
print 'WvTest: %d tests, %d failures.' % (wvtest._tests, wvtest._fails)
