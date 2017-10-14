'use strict';

var _wvtest_files = {};


function _wvtest_clean(s) {
  return (s + '').trim().replace(/\s/g, ' ');
}


function _wvtest_lookup(filename, line) {
    var f = _wvtest_files[filename];
    if (!f) {
        try {
            f = _wvtest_files[filename] = read(filename).split('\n');
        } catch (e) {
            f = _wvtest_files[filename] = [];
        }
    }
    return f[line - 1] || 'BAD_LINE'; // file line numbers are 1-based
}


function _v_ery_identifiable_stack_function() {
    return new Error();
}


var _wvtest_VISF_RE = /_v_ery_identifiable_stack_function/;
var _wvtest_FILELINE_RE = [
    // v8/chrome
    /\s+at .+ \((.+):(\d+):\d+\)$/,
    /\s+at (.+):(\d+):\d+$/,
    // safari or firefox
    /([^@]*):(\d+):\d+$/,
];


function wvtest_parse_trace(e) {
    var out = [];

    if (!e || !e.stack) {
        out.full = 'undefined-stack-1:0';
        out.push(['undefined-stack-1', 0]);
        return out;
    }

    var found_line = -2;
    var lines = e.stack.split('\n');
    for (var i in lines) {
        var g;
        if (lines[i].match(_wvtest_VISF_RE)) {
            found_line = out.length;
        }
        for (var r in _wvtest_FILELINE_RE) {
          g = lines[i].match(_wvtest_FILELINE_RE[r]);
          if (g) break;
        }
        if (g) {
            out.push([g[1], parseInt(g[2])]);
        }
    }

    // skip _VISF_RE and one additional line (its caller), if found
    out = out.slice(found_line + 2);
    out.full = e.stack;
    return out;
}


function wvtest_trace() {
    var e = _v_ery_identifiable_stack_function();
    return wvtest_parse_trace(e);
}


function _wvtest_pad(len, s) {
    s += '';
    while (s.length < len) {
        s += ' ';
    }
    return s;
}


function wvtest_check(cond, trace, condstr) {
    try {
        if (!trace.length) trace.push(['missing-trace', 0]);
        if (!trace.full) trace.full = trace.join('\n');
        if (!cond) {
            var full = trace.full + '';
            print('\nBacktrace:\n  ' + full.split('\n').join('\n  '));
        }
        print('!', _wvtest_pad(15, trace[0][0] + ':' + trace[0][1]),
              _wvtest_pad(54, _wvtest_clean(condstr)),
              cond ? 'ok' : 'FAILED');
        return cond;
    } catch (e) {
        print('eek! e.full:', e.full);
        print('eek! Backtrace:', (new Error()).stack);
        print('! wvtest exception: ' + e + ' FAILED');
        throw e;
    }
}


function _wvtest_content(tracerow) {
    var WV_RE = /WV[\w_]+\((.*)\)/;
    var line = _wvtest_lookup(tracerow[0], tracerow[1]);
    var g = line.match(WV_RE);
    return g ? g[1] : _wvtest_clean(line);
}


function WVPASS(cond) {
    var t = wvtest_trace();
    if (arguments.length >= 1) {
        var condstr = _wvtest_content(t[1]);
        return wvtest_check(cond, t.slice(1), condstr);
    } else {
        // WVPASS() with no arguments is a pass, although cond would
        // default to false
        return wvtest_check(true, t.slice(1), '');
    }
}


function WVFAIL(cond) {
    var t = wvtest_trace();
    if (arguments.length >= 1) {
        var condstr = 'NOT(' + _wvtest_content(t[1]) + ')';
        return wvtest_check(!cond, t.slice(1), condstr);
    } else {
        // WVFAIL() with no arguments is a fail, although cond would
        // default to false (which is a pass)
        return wvtest_check(false, t.slice(1), 'NOT()');
    }
}


function WVEXCEPT(etype, func) {
    var t = wvtest_trace();
    try {
        func();
    } catch (e) {
        return wvtest_check(e instanceof etype, t.slice(1),
                      '[' + e + '] instanceof [' + etype + ']');
    }
    return wvtest_check(false, t.slice(1), 'no exception: ' + etype);
}


function WVPASSEQ(a, b, precision) {
    var t = wvtest_trace();
    if (a && b && a.join && b.join) {
        a = a.join('|');
        b = b.join('|');
    }
    var cond = precision ? Math.abs(a - b) < precision : (a == b);
    return wvtest_check(cond, t.slice(1), '' + a + ' == ' + b);
}


function WVPASSNE(a, b, precision) {
    var t = wvtest_trace();
    if (a.join && b.join) {
        a = a.join('|');
        b = b.join('|');
    }
    var cond = precision ? Math.abs(a - b) >= precision : (a != b);
    return wvtest_check(a != b, t.slice(1), '' + a + ' != ' + b);
}


function WVPASSLT(a, b) {
    var t = wvtest_trace();
    return wvtest_check(a < b, t.slice(1), '' + a + ' < ' + b);
}


function WVPASSGT(a, b) {
    var t = wvtest_trace();
    return wvtest_check(a > b, t.slice(1), '' + a + ' > ' + b);
}


function WVPASSLE(a, b) {
    var t = wvtest_trace();
    return wvtest_check(a <= b, t.slice(1), '' + a + ' <= ' + b);
}


function WVPASSGE(a, b) {
    var t = wvtest_trace();
    return wvtest_check(a >= b, t.slice(1), '' + a + ' >= ' + b);
}


function wvtest(name, f) {
    var filename = (wvtest_trace()[1] || ['UNKNOWN'])[0];
    print('\nTesting "' + name + '" in ' + filename + ':');
    return f();
}
