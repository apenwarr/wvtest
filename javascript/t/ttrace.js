var TEST_STACKS = [

// v8shell command line
["Error: herror\n\
    at h ((shell):1:24)\n\
    at g ((shell):1:18)\n\
    at f ((shell):1:18)\n\
    at (shell):1:7",
  [['(shell)', 1],
   ['(shell)', 1],
   ['(shell)', 1],
   ['(shell)', 1],
  ]],

// v8shell from a file
["Error: herror\n\
    at h (stackgen.js:3:24)\n\
    at g (stackgen.js:2:18)\n\
    at f (stackgen.js:1:18)\n\
    at stackgen.js:5:5",
  [['stackgen.js', 3],
   ['stackgen.js', 2],
   ['stackgen.js', 1],
   ['stackgen.js', 5],
  ]],

// Chrome V8 console
["Error: herror\n\
    at h (<anonymous>:4:24)\n\
    at g (<anonymous>:3:18)\n\
    at f (<anonymous>:2:18)\n\
    at <anonymous>:6:5",
  [['<anonymous>', 4],
   ['<anonymous>', 3],
   ['<anonymous>', 2],
   ['<anonymous>', 6],
  ]],

// Chrome V8 from a web page (with or without a custom exception subclass)
["Error: herror\n\
    at h (file://wvtest/javascript/t/stackgen.js:4:24)\n\
    at g (file://wvtest/javascript/t/stackgen.js:3:18)\n\
    at f (file://wvtest/javascript/t/stackgen.js:2:18)\n\
    at file://wvtest/javascript/t/stackgen.js:6:5",
  [['file://wvtest/javascript/t/stackgen.js', 4],
   ['file://wvtest/javascript/t/stackgen.js', 3],
   ['file://wvtest/javascript/t/stackgen.js', 2],
   ['file://wvtest/javascript/t/stackgen.js', 6],
  ]],

// Safari jsc command line
["h@Interpreter:1:33\n\
g@Interpreter:1:19\n\
f@Interpreter:1:19\n\
global code@Interpreter:2:6",
  [['Interpreter', 1],
   ['Interpreter', 1],
   ['Interpreter', 1],
   ['Interpreter', 2],
  ]],

// Safari jsc from a file
["h@stackgen.js:3:33\n\
g@stackgen.js:2:19\n\
f@stackgen.js:1:19\n\
global code@stackgen.js:5:6",
  [['stackgen.js', 3],
   ['stackgen.js', 2],
   ['stackgen.js', 1],
   ['stackgen.js', 5],
  ]],

// Safari jsc from a file, with a custom exception subclass
["TestError\n\
h@stackgen.js:4:37\n\
g@stackgen.js:3:19\n\
f@stackgen.js:2:19\n\
global code@stackgen.js:6:6",
  [['stackgen.js', 4],
   ['stackgen.js', 3],
   ['stackgen.js', 2],
   ['stackgen.js', 6],
  ]],

// Safari from a web page, with a custom exception subclass
["TestError\n\
h@file://wvtest/javascript/t/stackgen.js:4:37\n\
g@file://wvtest/javascript/t/stackgen.js:3:19\n\
f@file://wvtest/javascript/t/stackgen.js:2:19\n\
global code@file://wvtest/javascript/t/stackgen.js:6:6",
  [['file://wvtest/javascript/t/stackgen.js', 4],
   ['file://wvtest/javascript/t/stackgen.js', 3],
   ['file://wvtest/javascript/t/stackgen.js', 2],
   ['file://wvtest/javascript/t/stackgen.js', 6],
  ]],

// Firefox console
["h@debugger eval code:3:18\n\
g@debugger eval code:2:18\n\
f@debugger eval code:1:18\n\
@debugger eval code:5:5\n\
",
  [['debugger eval code', 3],
   ['debugger eval code', 2],
   ['debugger eval code', 1],
   ['debugger eval code', 5],
  ]],

// Firefox console, with a custom exception subclass
["TestError@debugger eval code:795:19\n\
h@debugger eval code:4:24\n\
g@debugger eval code:3:18\n\
f@debugger eval code:2:18\n\
@debugger eval code:6:5\n\
",
  [['debugger eval code', 795],
   ['debugger eval code', 4],
   ['debugger eval code', 3],
   ['debugger eval code', 2],
   ['debugger eval code', 6],
  ]],

// Firefox from a web page, with a custom exception subclass
["TestError@file:///wvtest/javascript/t/stackgen.js:795:19\n\
h@file:///wvtest/javascript/t/stackgen.js:4:24\n\
g@file:///wvtest/javascript/t/stackgen.js:3:18\n\
f@file:///wvtest/javascript/t/stackgen.js:2:18\n\
@file:///wvtest/javascript/t/stackgen.js:6:5\n\
",
  [
   ['file:///wvtest/javascript/t/stackgen.js', 795],
   ['file:///wvtest/javascript/t/stackgen.js', 4],
   ['file:///wvtest/javascript/t/stackgen.js', 3],
   ['file:///wvtest/javascript/t/stackgen.js', 2],
   ['file:///wvtest/javascript/t/stackgen.js', 6],
  ]],
];

wvtest('trace parsing', function() {
  for (var i in TEST_STACKS) {
    var str = TEST_STACKS[i][0];
    print('Parsing: "' + str + '"');
    var want_stack = TEST_STACKS[i][1];
    var got_stack = wvtest_parse_trace({ stack: str });
    print('Want:', want_stack.join(' | '));
    print(' Got:', got_stack.join(' | '));
    WVPASS(got_stack.full);
    WVPASSEQ(str, got_stack.full);
    if (WVPASSEQ(want_stack.length, got_stack.length)) {
      for (var j in want_stack) {
        WVPASSEQ(want_stack[j][0], got_stack[j][0]);
        WVPASSEQ(want_stack[j][1], got_stack[j][1]);
      }
    }
  }
});


wvtest('trace generation', function() {
  t = wvtest_trace();
  print('Self trace:', t.join(' | '));
  WVPASS(t[0][0].match(/ttrace\.js$/));
});
