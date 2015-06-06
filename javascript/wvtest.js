
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
    return f[line-1] || 'BAD_LINE'; // file line numbers are 1-based
}


// TODO(apenwarr): Right now this only really works right on chrome.
// Maybe take some advice from this article:
//  http://stackoverflow.com/questions/5358983/javascript-stack-inspection-on-safari-mobile-ipad
function trace() {
    var FILELINE_RE = /[\b\s]\(?([^:\s]+):(\d+)/;
    var out = [];
    var e = Error().stack;
    if (!e) {
        return [['UNKNOWN', 0], ['UNKNOWN', 0]];
    }
    var lines = e.split('\n');
    for (i in lines) {
	if (i > 2) {
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
	return _check(false, t, 'NOT()')
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
    var cond = precision ? Math.abs(a-b) < precision : (a == b);
    return _check(cond, t, '' + a + ' == ' + b);
}


function WVPASSNE(a, b, precision) {
    var t = trace()[1];
    if (a.join && b.join) {
        a = a.join('|');
        b = b.join('|');
    }
    var cond = precision ? Math.abs(a-b) >= precision : (a != b);
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


function print_trace() {
    print(trace())
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
});
