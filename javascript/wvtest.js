
var files = {};

function lookup(filename, line) {
    var f = files[filename];
    if (!f) {
        try {
            f = files[filename] = read(filename).split('\n');
        } catch (e) {
            f = files[filename] = [];
        }
    }
    return f[line - 1] || 'BAD_LINE'; // file line numbers are 1-based
}


function _v_ery_identifiable_stack_function() {
    return Error().stack;
}


function trace() {
    var FILELINE_RE = /([^@\(:\s]+\.js):(\d+)/;
    var out = [];
    var e = _v_ery_identifiable_stack_function();
    if (!e) {
        return [['UNKNOWN', 0], ['UNKNOWN', 0]];
    }
    var lines = e.split('\n');
    var active = 0;
    for (i in lines) {
        if (!active && lines[i].match(/_v_ery_identifiable_stack_function/)) {
            // skip any gunk before the trace
            active = 1;
        } else if (active == 1) {
            // skip trace() itself
            active = 2;
        } else if (active) {
            g = lines[i].match(FILELINE_RE);
            if (g) {
                out.push([g[1], parseInt(g[2])]);
            } else {
                out.push(['UNKNOWN', 0]);
            }
        }
    }
    return out;
}


function _pad(len, s) {
    s += '';
    while (s.length < len) {
        s += ' ';
    }
    return s;
}


function _check(cond, trace, condstr) {
    print('!', _pad(15, trace[0] + ':' + trace[1]),
          _pad(54, condstr),
          cond ? 'ok' : 'FAILED');
}


function _content(trace) {
    var WV_RE = /WV[\w_]+\((.*)\)/;
    var line = lookup(trace[0], trace[1]);
    var g = line.match(WV_RE);
    return g ? g[1] : '...';
}


function WVPASS(cond) {
    var t = trace()[1];
    if (arguments.length >= 1) {
        var condstr = _content(t);
        return _check(cond, t, condstr);
    } else {
        // WVPASS() with no arguments is a pass, although cond would
        // default to false
        return _check(true, t, '');
    }
}


function WVFAIL(cond) {
    var t = trace()[1];
    if (arguments.length >= 1) {
        var condstr = 'NOT(' + _content(t) + ')';
        return _check(!cond, t, condstr);
    } else {
        // WVFAIL() with no arguments is a fail, although cond would
        // default to false (which is a pass)
        return _check(false, t, 'NOT()');
    }
}


function WVEXCEPT(etype, func) {
    var t = trace()[1];
    try {
        func();
    } catch (e) {
        return _check(e instanceof etype, t, e);
    }
    return _check(false, t, 'no exception: ' + etype);
}


function WVPASSEQ(a, b, precision) {
    var t = trace()[1];
    if (a && b && a.join && b.join) {
        a = a.join('|');
        b = b.join('|');
    }
    var cond = precision ? Math.abs(a - b) < precision : (a == b);
    return _check(cond, t, '' + a + ' == ' + b);
}


function WVPASSNE(a, b, precision) {
    var t = trace()[1];
    if (a.join && b.join) {
        a = a.join('|');
        b = b.join('|');
    }
    var cond = precision ? Math.abs(a - b) >= precision : (a != b);
    return _check(a != b, t, '' + a + ' != ' + b);
}


function WVPASSLT(a, b) {
    var t = trace()[1];
    return _check(a < b, t, '' + a + ' < ' + b);
}


function WVPASSGT(a, b) {
    var t = trace()[1];
    return _check(a > b, t, '' + a + ' > ' + b);
}


function WVPASSLE(a, b) {
    var t = trace()[1];
    return _check(a <= b, t, '' + a + ' <= ' + b);
}


function WVPASSGE(a, b) {
    var t = trace()[1];
    return _check(a >= b, t, '' + a + ' >= ' + b);
}


function wvtest(name, f) {
    print('\nTesting "' + name + '" in ' + trace()[1][0] + ':');
    return f();
}
