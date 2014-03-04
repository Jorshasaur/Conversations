(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":5}],2:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],5:[function(require,module,exports){
var process=require("__browserify_process"),global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

},{"./support/isBuffer":4,"__browserify_process":3,"inherits":2}],6:[function(require,module,exports){
(function() {
  'use strict';

  /**
   * Extend an Object with another Object's properties.
   *
   * The source objects are specified as additional arguments.
   *
   * @param dst Object the object to extend.
   *
   * @return Object the final object.
   */
  var _extend = function(dst) {
    var sources = Array.prototype.slice.call(arguments, 1);
    for (var i=0; i<sources.length; ++i) {
      var src = sources[i];
      for (var p in src) {
        if (src.hasOwnProperty(p)) dst[p] = src[p];
      }
    }
    return dst;
  };

  /**
   * Based on the algorithm at http://en.wikipedia.org/wiki/Levenshtein_distance.
   */
  var Levenshtein = {
    /**
     * Calculate levenshtein distance of the two strings.
     *
     * @param str1 String the first string.
     * @param str2 String the second string.
     * @return Integer the levenshtein distance (0 and above).
     */
    get: function(str1, str2) {
      // base cases
      if (str1 === str2) return 0;
      if (str1.length === 0) return str2.length;
      if (str2.length === 0) return str1.length;

      // two rows
      var previous  = new Array(str2.length + 1),
          current = new Array(str2.length + 1),
          i, j;

      // initialise previous row
      for (i=0; i<previous.length; ++i) {
        previous[i] = i;
      }

      // calculate current row distance from previous row
      for (i=0; i<str1.length; ++i) {
        current[0] = i + 1;

        for (j=0; j<str2.length; ++j) {
          current[j + 1] = Math.min(
              previous[j] + ( (str1.charAt(i) === str2.charAt(j)) ? 0 : 1 ),    // substitution
              current[j] + 1,    // insertion
              previous[j + 1] + 1 // deletion
          );

          // copy current into previous (in preparation for next iteration)
          previous[j] = current[j];
        }

        // copy current into previous (in preparation for next iteration)
        previous[j] = current[j];
      }

      return current[str2.length];
    },

    /**
     * Asynchronously calculate levenshtein distance of the two strings.
     *
     * @param str1 String the first string.
     * @param str2 String the second string.
     * @param cb Function callback function with signature: function(Error err, int distance)
     * @param [options] Object additional options.
     * @param [options.progress] Function progress callback with signature: function(percentComplete)
     */
    getAsync: function(str1, str2, cb, options) {
      options = _extend({}, {
        progress: null
      }, options);

      // base cases
      if (str1 === str2) return cb(null, 0);
      if (str1.length === 0) return cb(null, str2.length);
      if (str2.length === 0) return cb(null, str1.length);

      // two rows
      var previous  = new Array(str2.length + 1),
          current = new Array(str2.length + 1),
          i, j, startTime, currentTime;

      // initialise previous row
      for (i=0; i<previous.length; ++i) {
        previous[i] = i;
      }

      current[0] = 1;

      i = 0;
      j = -1;

      var __calculate = function() {
        // reset timer
        startTime = new Date().valueOf();
        currentTime = startTime;

        // keep going until one second has elapsed
        while (currentTime - startTime < 1000) {
          // reached end of current row?
          if (str2.length <= (++j)) {
            // copy current into previous (in preparation for next iteration)
            previous[j] = current[j];

            // if already done all chars
            if (str1.length <= (++i)) {
              return cb(null, current[str2.length]);
            }
            // else if we have more left to do
            else {
              current[0] = i + 1;
              j = 0;
            }
          }

          // calculation
          current[j + 1] = Math.min(
              previous[j] + ( (str1.charAt(i) === str2.charAt(j)) ? 0 : 1 ),    // substitution
              current[j] + 1,    // insertion
              previous[j + 1] + 1 // deletion
          );

          // copy current into previous (in preparation for next iteration)
          previous[j] = current[j];

          // get current time
          currentTime = new Date().valueOf();
        }

        // send a progress update?
        if (null !== options.progress) {
          try {
            options.progress.call(null, (i * 100.0/ str1.length));
          } catch (err) {
            return cb('Progress callback: ' + err.toString());
          }
        }

        // next iteration
        setTimeout(__calculate(), 0);
      };

      __calculate();
    }

  };


  if (typeof define !== "undefined" && define !== null && define.amd) {
    define(function() {
      return Levenshtein;
    });
  } else if (typeof module !== "undefined" && module !== null) {
    module.exports = Levenshtein;
  } else {
    if (typeof window !== "undefined" && window !== null) {
      window.Levenshtein = Levenshtein;
    }
  }
}());


},{}],7:[function(require,module,exports){
var CharacterQueue;

CharacterQueue = (function() {
  function CharacterQueue() {
    this.cache = [];
  }

  CharacterQueue.prototype.addCharacter = function(character) {
    this.cache.push(character);
    return this.reset();
  };

  CharacterQueue.prototype.reset = function() {
    return this.characters = this.cache.slice(0);
  };

  CharacterQueue.prototype.next = function() {
    var character, ran;
    if (this.characters.length === 0) {
      return 0;
    }
    ran = this.random();
    character = this.characters[ran];
    this.characters.splice(ran, 1);
    return character;
  };

  CharacterQueue.prototype.random = function() {
    var ran;
    ran = Math.round(Math.random() * (this.characters.length - 1));
    return ran;
  };

  return CharacterQueue;

})();

module.exports = CharacterQueue;


},{}],8:[function(require,module,exports){
var Character, leven;

leven = require('fast-levenshtein');

Character = (function() {
  var shuffle;

  function Character(name, image) {
    this.name = name;
    this.image = image;
    this.replies = [];
    this.buildReplies();
    this.lastReply = "";
    this.replyHistory = [];
  }

  Character.prototype.buildReplies = function() {
    this.replies.push("I have no idea.");
    this.replies.push("You should think more on that.");
    this.replies.push("That doesn't make any sense, please elaborate.");
    return this.replies.push("Really?  That doesn't sound right.");
  };

  Character.prototype.ask = function(question) {
    var rep, shuffled;
    shuffled = this.cloneReplies();
    rep = this.getReply(question, shuffled);
    return this.lastReply;
  };

  Character.prototype.addToHistory = function(reply) {
    if (this.replyHistory.length === 3) {
      this.replyHistory.pop();
    }
    return this.replyHistory.push(this.lastReply);
  };

  Character.prototype.isInReplyHistory = function(reply) {
    var rep, _i, _len, _ref;
    _ref = this.replyHistory;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      rep = _ref[_i];
      if (rep === reply) {
        return true;
      }
    }
    return false;
  };

  Character.prototype.getReply = function(question, shuffled) {
    var count, distance, reply, _i, _len;
    this.closestDistance = 999;
    question = this.formatSentence(question);
    for (count = _i = 0, _len = shuffled.length; _i < _len; count = ++_i) {
      reply = shuffled[count];
      distance = leven.get(this.formatSentence(reply), question);
      if (distance > 0 && distance < this.closestDistance && !this.isInReplyHistory(reply)) {
        this.closestDistance = distance;
        this.lastReply = reply;
      }
    }
    this.addToHistory(this.lastReply);
    return this.lastReply;
  };

  Character.prototype.getRandomReplyWithExclusion = function(index) {
    var clone;
    clone = this.cloneReplies();
    clone.splice(index, 1);
    return this.getRandomReply(clone);
  };

  Character.prototype.getRandomReply = function(array) {
    var rand;
    rand = Math.round(Math.random() * (array.length - 1));
    return array[rand];
  };

  Character.prototype.random = function() {
    this.lastReply = this.getRandomReply(this.replies);
    return this.lastReply;
  };

  Character.prototype.formatSentence = function(sentence) {
    sentence = this.stripCharacters(sentence);
    return sentence.toLowerCase();
  };

  Character.prototype.stripCharacters = function(sentence) {
    return sentence.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  };

  Character.prototype.cloneReplies = function() {
    return this.replies.slice(0);
  };

  shuffle = function(arr, required) {
    var i, index, randInt, _i, _ref, _ref1, _ref2;
    if (required == null) {
      required = arr.length;
    }
    randInt = function(n) {
      return Math.floor(n * Math.random());
    };
    if (required > arr.length) {
      required = arr.length;
    }
    if (required <= 1) {
      return arr[randInt(arr.length)];
    }
    for (i = _i = _ref = arr.length - 1, _ref1 = arr.length - required; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = _ref <= _ref1 ? ++_i : --_i) {
      index = randInt(i + 1);
      _ref2 = [arr[i], arr[index]], arr[index] = _ref2[0], arr[i] = _ref2[1];
    }
    return arr.slice(arr.length - required);
  };

  return Character;

})();

module.exports = Character;


},{"fast-levenshtein":6}],9:[function(require,module,exports){
var Character, Spock,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Character = require("./character.coffee");

Spock = (function(_super) {
  __extends(Spock, _super);

  function Spock() {
    Spock.__super__.constructor.apply(this, arguments);
    this.name = "Spock";
    this.image = "images/spock.jpg";
  }

  Spock.prototype.buildReplies = function() {
    this.replies.push("It is curious how often you humans manage to obtain that which you do not want.");
    this.replies.push("I am endeavoring, ma'am, to construct a mnemonic circuit using stone knives and bearskins.");
    this.replies.push("I have never understood the female capacity to avoid a direct answer to any question.");
    this.replies.push("If there are self-made purgatories, then we all have to live in them. Mine can be no worse than someone else's.");
    this.replies.push("Logic is a little tweeting bird chirping in meadow. Logic is a wreath of pretty flowers that smell bad.");
    this.replies.push("Your illogical approach to chess does have its advantages on occasion.");
    this.replies.push("After a time, you may find that having is not so pleasing a thing, after all, as wanting. It is not logical, but it is often true.");
    this.replies.push("Computers make excellent and efficient servants, but I have no wish to serve under them.");
    this.replies.push("Judging by the pollution content of the atmosphere, I believe we have arrived at the late twentieth century.");
    this.replies.push("They like you very much, but they are not the hell your whales.");
    this.replies.push("Nowhere am I so desperately needed as among a shipload of illogical humans.");
    this.replies.push("On my planet \"to rest\" is to rest, to cease using energy. To me it is quite illogical to run up and down on green grass using energy instead of saving it.");
    this.replies.push("Fascinating is a word I use for the unexpected. In this case, I should think \"interesting\" would suffice. ");
    this.replies.push("You almost make me believe in luck.");
    this.replies.push("If I seem insensitive to what you’re going through understand – it’s the way I am.");
    this.replies.push("May I say that I have not thoroughly enjoyed serving with Humans? I find their illogic and foolish emotions a constant irritant.");
    this.replies.push("Fortunately, my ancestors spawned in another ocean than yours did. My blood cells are quite different.");
    this.replies.push("Your logic was impeccable. We are in grave danger.");
    this.replies.push("Interesting. You Earth people glorify organized violence for 40 centuries, but you imprison those who employ it privately.");
    this.replies.push("Where there is no emotion, there is no motive for violence.");
    this.replies.push("Has it occurred to you that there is a certain inefficiency in constantly questioning me on things you’ve already made up your mind about?");
    this.replies.push("A very interesting game, this poker.");
    this.replies.push("This troubled planet is a place of the most violent contrasts. Those who receive the rewards are totally separated from those who shoulder the burdens. It is not a wise leadership.");
    this.replies.push("The most unfortunate lack in current computer programming is that there is nothing available to immediately replace the starship surgeon.");
    this.replies.push("Pain is a thing of the mind. The mind can be controlled.");
    this.replies.push("Being a red blooded human clearly has it’s disadvantages.");
    this.replies.push("Frankly, I was rather dismayed by your use of the term 'half-breed'. You must admit it is an unsophisticated expression.");
    return this.replies.push("In critical moments men sometimes see exactly what they wish to see.");
  };

  return Spock;

})(Character);

module.exports = Spock;


},{"./character.coffee":8}],10:[function(require,module,exports){
var Character, Swanson,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Character = require("./character.coffee");

Swanson = (function(_super) {
  __extends(Swanson, _super);

  function Swanson() {
    Swanson.__super__.constructor.apply(this, arguments);
    this.name = "Ron Swanson";
    this.image = "images/swanson.jpg";
  }

  Swanson.prototype.buildReplies = function() {
    this.replies.push("Clear alcohols are for rich women on diets.");
    this.replies.push("Crying: acceptable at funerals and the Grand Canyon.");
    this.replies.push("I am going to consume all of this at the same time because I am a free American.");
    this.replies.push("Under my tutelage, you will grow from boys to men. From men into gladiators. And from gladiators into Swansons.");
    this.replies.push("I'm a simple man. I like pretty, dark-haired women, and breakfast food.");
    this.replies.push("Never half-ass two things. Whole-ass one thing.");
    this.replies.push("Straight down the middle. No hook, no spin, no fuss. Anything more and this becomes figure skating.");
    this.replies.push("I don’t want to paint with a broad brush here, but every single contractor in the world is a miserable, incompetent thief.");
    this.replies.push("Fishing relaxes me. It’s like yoga, except I still get to kill something.");
    this.replies.push("Just give me all the bacon and eggs you have.");
    this.replies.push("When people get a little too chummy with me I like to call them by the wrong name to let them know I don’t really care about them.");
    this.replies.push("There’s only one thing I hate more than lying: skim milk. Which is water that’s lying about being milk.");
    this.replies.push("The government is a greedy piglet that suckles on a taxpayer’s teat until they have sore, chapped nipples.");
    this.replies.push("I once worked with a guy for three years and never learned his name. Best friend I ever had. We still never talk sometimes.");
    this.replies.push("When I eat, it is the food that is scared.");
    this.replies.push("My only official recommendations are US Army-issued mustache trimmers, Morton’s Salt, and the C.R. Lawrence Fein two inch axe-style scraper oscillating knife blade.");
    this.replies.push("Are you going to tell a man that he can’t fart in his own car?");
    this.replies.push("Turkey can never beat cow.");
    this.replies.push("It’s always a good idea to demonstrate to your coworkers that you are capable of withstanding a tremendous amount of pain.");
    this.replies.push("There are three acceptable haircuts: high and tight, crew cut, buzz cut.");
    this.replies.push("Capitalism: God’s way of determining who is smart and who is poor.");
    this.replies.push("Any dog under fifty pounds is a cat and cats are useless.");
    this.replies.push("Fish, for sport only, not for meat. Fish meat is practically a vegetable.");
    this.replies.push("There is only one bad word: taxes.");
    this.replies.push("History began July 4th, 1776. Anything before that was a mistake.");
    this.replies.push("Cultivating a manly musk puts opponent on notice.");
    this.replies.push("Give a man a fish and feed him for a day. Don’t teach a man to fish…and feed yourself. He’s a grown man. And fishing’s not that hard.");
    this.replies.push("Child labor laws are ruining this country.");
    this.replies.push("Great job, everyone. The reception will be held in each of our individual houses, alone.");
    this.replies.push("America: The only country that matters. If you want to experience other 'cultures,' use an atlas or a ham radio.");
    this.replies.push("The key to burning an ex-wife effigy is to dip it in paraffin wax and then toss the flaming bottle of isopropyl alcohol from a safe distance. Do not stand too close when you light an ex-wife effigy.");
    this.replies.push("There are only three ways to motivate people: money, fear, and hunger.");
    this.replies.push("Shorts over six inches are capri pants, shorts under six inches are European.");
    this.replies.push("Friends: one to three is sufficient.");
    this.replies.push("Breakfast food can serve many purposes.");
    this.replies.push("One rage every three months is permitted. Try not to hurt anyone who doesn’t deserve it.");
    this.replies.push("Strippers do nothing for me…but I will take a free breakfast buffet anytime, anyplace.");
    return this.replies.push("On second thought i think i will have that third steak.");
  };

  return Swanson;

})(Character);

module.exports = Swanson;


},{"./character.coffee":8}],11:[function(require,module,exports){
var Character, Veronica,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Character = require("./character.coffee");

Veronica = (function(_super) {
  __extends(Veronica, _super);

  function Veronica() {
    Veronica.__super__.constructor.apply(this, arguments);
    this.name = "Veronica Palmer";
    this.image = "images/veronica.jpg";
  }

  Veronica.prototype.buildReplies = function() {
    this.replies.push("Money before people, that's the company motto!.");
    this.replies.push("My door is always open, please close it on the way out.");
    this.replies.push("The forest will run red with the blood of woodland creatures who doubted little Veronica and will now pay with their furry little lives.");
    this.replies.push("I saw what was going on in there between you and Fraulein Cheekbones. When you show her around town, keep your Hansels off her Gretels.");
    this.replies.push("Oh, God, we have unhappy Germans. Nothing good has ever come from that.");
    this.replies.push("Because I'm good at everything I do. I'm not bragging, because bragging is the one thing I'm not good at. Although, if I wanted to be, I'd be excellent at that, too. As I just proved.");
    this.replies.push("Do you live here? Do all the cubicle workers have little hobbit holes like this?");
    this.replies.push("We believe the multi-language translator will create a furor in Germany, a furor that will sweep across Europe, crushing... no.");
    this.replies.push("It's just a fun game we're playing--like dress-up, only instead of clothes, we're dressing up the things that are coming out of your mouth.");
    this.replies.push("I want to burn his diaper and salt the earth beneath it so no new product will ever grow there.");
    this.replies.push("Well, you are eager and desperate for my approval. And that's two of the three qualities I look for in a partner.");
    this.replies.push("Then I am ready to leave the monastery and avenge my parents.");
    this.replies.push("I just buy expensive shoes made from very soft animals.");
    this.replies.push("I don't take the high road. The high road leads to Pansy Town.");
    this.replies.push("You're so moral and perfect all the time. Do singing birds and mice dress you and brush your hair in the morning?");
    this.replies.push("Has waving your hands ever sold me on anything?");
    this.replies.push("Did that MRE touch your boobies? Then shut the hell up.");
    this.replies.push("In fact, we need to talk about us. And the future of our babies and how they'll be committed.");
    this.replies.push("I need this relationship to have a future because I need babies.");
    this.replies.push("I think I might need new breasts. These are covered in sadness.");
    this.replies.push("I don't hate the Dutch. I love the Dutch. That's why I hold them to a higher standard.");
    this.replies.push("So this is guilt, huh? In the past, I've always just counteracted this feeling with other emotions, like sugar or drunk.");
    this.replies.push("Maybe my kindergarten teacher was right. Maybe I am too controlling.");
    this.replies.push("No, the microphone-attaching elf who lives in my drawer.");
    this.replies.push("Together, we're like Gandhi. I'm skinny, and you're tan.");
    this.replies.push("The company loves its money. If they could, they'd go to strip clubs and throw naked women at money.");
    this.replies.push("The company feels that if we ease up because someone dies, it will only encourage other people to die.");
    this.replies.push("I heard about Jenkins' death. The company feels terrible about it.");
    this.replies.push("They're also floating the idea that his being dead may have been a pre-existing condition, and that he may not have been alive when we hired him.");
    this.replies.push("So am I, and I'll bet Rommel didn't wear a thong underneath his.");
    this.replies.push("That's the sound of me deflecting the whiny bitching with my happiness shield.");
    this.replies.push("Great news! You both have a disease.");
    this.replies.push("We're having a problem with some of those people who live in the cubicles.");
    this.replies.push("Then when their guard's down, smash them with a phone.");
    return this.replies.push("God, you people are paranoid. No wonder the company has to secretly manipulate you.");
  };

  return Veronica;

})(Character);

module.exports = Veronica;


},{"./character.coffee":8}],12:[function(require,module,exports){
var CharacterQueue, Spock, Swanson, Veronica, assert;

assert = require('assert');

CharacterQueue = require('../scripts/characters/character-queue.coffee');

Spock = require('../scripts/characters/spock.coffee');

Swanson = require('../scripts/characters/swanson.coffee');

Veronica = require('../scripts/characters/veronica.coffee');

describe("Character Queue", function() {
  beforeEach(function() {
    this.queue = new CharacterQueue();
    this.queue.addCharacter(new Spock);
    this.queue.addCharacter(new Swanson);
    return this.queue.addCharacter(new Veronica);
  });
  it("should have 3 characters when characters are added.", function() {
    return assert.equal(this.queue.characters.length, 3);
  });
  it("should have a length of 2 when one is removed using next.", function() {
    this.queue.next();
    return assert.equal(this.queue.characters.length, 2);
  });
  it("should have return 0 when all of the characters are removed.", function() {
    this.queue.next();
    this.queue.next();
    this.queue.next();
    return assert.equal(this.queue.next(), 0);
  });
  return it("should have a length of 3 when next is run 3 times and then reset is called", function() {
    this.queue.next();
    this.queue.next();
    this.queue.next();
    this.queue.reset();
    return assert.equal(this.queue.characters.length, 3);
  });
});


},{"../scripts/characters/character-queue.coffee":7,"../scripts/characters/spock.coffee":9,"../scripts/characters/swanson.coffee":10,"../scripts/characters/veronica.coffee":11,"assert":1}],13:[function(require,module,exports){
var Character, assert;

assert = require('assert');

Character = require('../scripts/characters/character.coffee');

describe("Character tests", function() {
  beforeEach(function() {
    return this.character = new Character();
  });
  it("should not find a distance of zero for 'I have no idea' when that is the question.", function() {
    this.character.ask("I have no idea.");
    return assert.notEqual(this.character.closestDistance, 0);
  });
  it("should not find a distance of zero for 'I have no idea' when that is the question with no punctuation.", function() {
    this.character.ask("I have no idea");
    return assert.notEqual(this.character.closestDistance, 0);
  });
  it("should not find a distance of zero for 'I have no idea' when that is the question with differing punctuation.", function() {
    this.character.ask("I have no idea!!!");
    return assert.notEqual(this.character.closestDistance, 0);
  });
  it("should not find a distance of zero for 'I have no idea' when that is the question with differing cases.", function() {
    this.character.ask("I HAVE NO IDEA.");
    return assert.notEqual(this.character.closestDistance, 0);
  });
  it("should answer 'I have no idea.' to 'What are you wearing today?'", function() {
    var answer;
    answer = this.character.ask("What are you wearing today?");
    return assert.equal(answer, "I have no idea.");
  });
  it("should not have a distance 0 to 'What are you wearing today?'", function() {
    this.character.ask("What are you wearing today?");
    return assert.notEqual(this.character.closestDistance, 0);
  });
  it("should answer 'You should think more on that.' to 'I should think more about rabbits.'", function() {
    var answer;
    answer = this.character.ask("I should think about more rabbits.");
    return assert.equal(answer, "You should think more on that.");
  });
  it("should not give the same answer immediately for the same question", function() {
    var answer, answer2, question;
    question = "I should think about more rabbitss.";
    answer = this.character.ask(question);
    answer2 = this.character.ask(question);
    return assert.notEqual(answer, answer2);
  });
  it("should not give the same answer for the last 3 questions", function() {
    var answer, answer2, answer3, question;
    question = "I should think about more rabbits..";
    answer = this.character.ask(question);
    answer2 = this.character.ask(question);
    answer3 = this.character.ask(question);
    assert.notEqual(answer, answer2);
    assert.notEqual(answer, answer3);
    return assert.notEqual(answer2, answer3);
  });
  return it("should give the first answer on the 4th question that is the same", function() {
    var answer, answer2, answer3, answer4, question;
    question = "I should think about more rabbits..";
    answer = this.character.ask(question);
    answer2 = this.character.ask(question);
    answer3 = this.character.ask(question);
    answer4 = this.character.ask(question);
    return assert.notEqual(answer, answer4);
  });
});


},{"../scripts/characters/character.coffee":8,"assert":1}],14:[function(require,module,exports){
var Spock, assert;

assert = require('assert');

Spock = require('../scripts/characters/spock.coffee');

describe("Spock tests", function() {
  beforeEach(function() {
    return this.character = new Spock();
  });
  return it("should never answer the same answer as the question", function() {
    var answer;
    answer = this.character.ask("It is curious how often you humans manage to obtain that which you do not want.");
    return assert.notEqual(answer, "It is curious how often you humans manage to obtain that which you do not want.");
  });
});


},{"../scripts/characters/spock.coffee":9,"assert":1}]},{},[12,13,14])