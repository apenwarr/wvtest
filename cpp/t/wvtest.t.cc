#include "wvtest.h"

WVTEST_MAIN("wvtest tests")
{
    WVPASS(1);
    WVXFAIL(0);
    WVXFAIL(1);
    WVSKIP(non-existent);

    WVPASSEQ(1, 1);
    WVPASSNE(1, 2);
    WVPASSEQ(1, 1);
    WVPASSLT(1, 2);

    WVPASSEQ("hello", "hello");
    WVPASSNE("hello", "hello2");

    WVPASSEQ(std::string("hello"), std::string("hello"));
    WVPASSNE(std::string("hello"), std::string("hello2"));
}
