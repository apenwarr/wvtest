#include "wvtest.h"

WVTEST_MAIN("wvtest tests")
{
    WVPASS(1);
    WVFAIL(0);
    WVPASSEQ(1, 1);
    WVPASSNE(1, 2);
    WVPASSLT(1, 2);
}

WVTEST_MAIN("wvtest string tests")
{
    WVPASSEQSTR("hello", "hello");
    WVPASSNESTR("hello", "hello2");
    WVPASSLTSTR("hello", "hello2");
}
