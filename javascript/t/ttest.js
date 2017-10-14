'use strict';

function print_trace() {
    print(wvtest_trace())
}


function x() {
    print("x()");
    y(1);
}


function y(a) {
    print("y(", a, ")");
    z(a+5, a+6);
}


function z(a,b) {
    print("z(", a, b, ")");
    print_trace();
}


print("Hello world");
x();


wvtest('selftests', function() {
    WVPASS('yes');
    WVFAIL(false);
    WVFAIL(1 == 2);
    WVPASS();
    WVFAIL(false);
    WVEXCEPT(ReferenceError, function() { does_not_exist });
    WVEXCEPT(TypeError, null);
    WVPASSEQ('5', 5);
    WVPASSNE('5', 6);
    WVPASSNE(0.3, 1/3);
    WVPASSEQ(0.3, 1/3, 0.04);
    WVPASSNE(0.3, 1/3, 0.03);
    WVPASSLT('5', 6);
    WVPASSGT('6', '5');
    WVPASSLE('5', '6');
    WVPASSGE('5', 4);

    WVPASSEQ(read('t/empty'), '');
    WVPASSEQ(read('t/hello'), 'hello world');
    WVEXCEPT(Error, function() { read('.') });
    WVEXCEPT(Error, function() { load('nonexistent_file') });
    WVPASSEQ(load('t/empty'), undefined);
});
