from wvtest import *


count = 0


@wvtest
def moretest():
    global count
    count += 1
    WVPASS()
