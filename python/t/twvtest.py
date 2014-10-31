import __init__
from wvtest import *
import twvtest2  # twvtest2 will also run *before* us since we import it

last=None

def _except(*args):
    raise IOError(*args)


@wvtest
def moretest():
    WVPASSEQ(twvtest2.count, 1)


@wvtest
def test1():
    WVPASSIS(None, None)
    WVPASSISNOT(None, [])
    WVPASSISNOT({}, {})
    d = {}
    WVPASSIS(d, d)
    WVPASSEQ(1, 1)
    WVPASSNE(1, 2)
    WVPASSLT(1, 2)
    WVPASSLE(1, 1)
    WVPASSGT(2, 1)
    WVPASSGE(2, 2)
    WVPASSNEAR(1, 1)
    WVPASSFAR(1, 0)
    WVPASSNEAR(1, 1.0)
    WVPASSFAR(0.1, 0.2)
    WVPASSNEAR(0.000000005, 0.000000006)
    WVPASSFAR(0.000000005, 0.000000006, places=9)
    WVPASSNEAR(0.51, 0.53, delta=0.021)
    WVPASSFAR(0.51, 0.53, delta=0.019)
    WVEXCEPT(IOError, _except, 'my exception parameter')
    with WVEXCEPT(IOError):
      _except('arg')

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


@wvtest
def chdir_test():
    WVPASS(open('testfile.txt')) # will fail if chdir is wrong


if __name__ == '__main__':
    WVPASSEQ(twvtest2.count, 0)
    wvtest_main()
    wvtest_main()
    WVPASSEQ(last, 'booga1')
    WVPASSEQ(twvtest2.count, 1)
