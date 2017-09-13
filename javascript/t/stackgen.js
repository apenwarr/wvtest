class TestError extends Error {};
f = function() { g(); };
g = function() { h(); };
h = function() { throw new TestError('herror'); };
try {
    f();
} catch (e) {
    print('--' + e.stack + '--');
}
