from wvtest import *

last=None

def _except(*args):
    raise Exception(*args)

@wvtest
def test1():
    WVPASSLT(1, 2)
    WVPASSLE(1, 1)
    WVPASSGT(2, 1)
    WVPASSGE(2, 2)
    WVEXCEPT(Exception, _except, 'my exception parameter')
    
    # ensure tests run in the order they were declared
    global last
    WVPASSEQ(last, None)
    last='test1'

@wvtest
def booga2():
    # ensure tests run in the order they were declared
    global last
    WVPASSEQ(last, 'test1')
    last='booga2'
    
@wvtest
def booga1():
    # ensure tests run in the order they were declared
    global last
    WVPASSEQ(last, 'booga2')
    last='booga1'

