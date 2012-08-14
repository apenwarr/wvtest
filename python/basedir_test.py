from wvtest import *


@wvtest
def basedirtest():
    # check that wvtest works with test files in the base directory, not
    # just in subdirs.
    WVPASS()


if __name__ == '__main__':
    wvtest_main()
