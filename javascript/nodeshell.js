'use strict';

const vm = require('vm');
const sandbox = {};
let ctx;


function read(filename) {
  return require('fs').readFileSync(filename, 'utf8');
}


function load(filename) {
  let script = new vm.Script(read(filename), {
    displayErrors: true,
    filename: filename,
  });
  return script.runInContext(ctx);
}


sandbox.print = console.log;
sandbox.read = read;
sandbox.load = load;
sandbox.Error = Error;


// We run all the requested files in the same context, so they can share
// "local" variables with each other (but not with this file).
ctx = vm.createContext(sandbox);


// node.js prints a fairly useless message for unhandled promise rejections
// by default.  Let's print our own in a format that a) prints a stack
// trace, and b) makes sure wvtest logs a failure.
process.on('unhandledRejection', e => {
  console.log(e);
  console.log('! unhandledRejection  FAILED');
});


for (let i of process.argv.slice(2)) {
  load(i);
}
