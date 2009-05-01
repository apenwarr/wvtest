#include "wvtest.h"

WVTEST_MAIN("wvtest tests")
{
    WVPASS(1);
    WVPASSEQ(1, 1);
    WVPASSNE(1, 2);
    WVPASSEQ(1, 1);
    WVPASSLT(1, 2);
}
