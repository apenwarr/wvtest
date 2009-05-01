import traceback
import os.path
import re
import sys

_registered = []
_tests = 0
_fails = 0

def wvtest(func):
    ''' Use this decorator (@wvtest) in front of any function you want to run
        as part of the unit test suite.  Then run:
	    python wvtestmain.py path/to/yourtest.py
	to run all the @wvtest functions in that file.
    '''
    _registered.append(func)
    return func

def _result(msg, tb, code):
    global _tests, _fails
    _tests += 1
    if code != 'ok':
	_fails += 1
    (filename, line, func, text) = tb
    filename = os.path.basename(filename)
    msg = re.sub(r'\s+', ' ', str(msg))
    sys.stderr.flush()
    print '! %-70s %s' % ('%s:%-4d %s' % (filename, line, msg),
			  code)
    sys.stdout.flush()
    

def _check(cond, msg = 'unknown', tb = None):
    if tb == None: tb = traceback.extract_stack()[-3]
    if cond:
	_result(msg, tb, 'ok')
    else:
	_result(msg, tb, 'FAILED')
    return cond

def _code():
    (filename, line, func, text) = traceback.extract_stack()[-3]
    text = re.sub(r'^\w+\((.*)\)$', r'\1', text);
    return text

def WVPASS(cond = True):
    ''' Throws an exception unless cond is true. '''
    return _check(cond, _code())

def WVFAIL(cond = True):
    ''' Throws an exception unless cond is false. '''
    return _check(not cond, 'NOT(%s)' % _code())

def WVPASSEQ(a, b):
    ''' Throws an exception unless a == b. '''
    return _check(a == b, '%s == %s' % (repr(a), repr(b)))

def WVPASSNE(a, b):
    ''' Throws an exception unless a != b. '''
    return _check(a != b, '%s != %s' % (repr(a), repr(b)))

def WVPASSLT(a, b):
    ''' Throws an exception unless a < b. '''
    return _check(a < b, '%s < %s' % (repr(a), repr(b)))

def WVPASSLE(a, b):
    ''' Throws an exception unless a <= b. '''
    return _check(a <= b, '%s <= %s' % (repr(a), repr(b)))

def WVPASSGT(a, b):
    ''' Throws an exception unless a > b. '''
    return _check(a > b, '%s > %s' % (repr(a), repr(b)))

def WVPASSGE(a, b):
    ''' Throws an exception unless a >= b. '''
    return _check(a >= b, '%s >= %s' % (repr(a), repr(b)))


