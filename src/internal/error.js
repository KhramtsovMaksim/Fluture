import {show, noop} from './fn';
import {ordinal, namespace, name, version} from './const';
import type from 'sanctuary-type-identifiers';

export function error(message){
  return new Error(message);
}

export function typeError(message){
  return new TypeError(message);
}

export function invalidArgument(it, at, expected, actual){
  return typeError(
    it + ' expects its ' + ordinal[at] + ' argument to ' + expected + '\n  Actual: ' + show(actual)
  );
}

export function invalidContext(it, actual){
  return typeError(
    it + ' was invoked outside the context of a Future. You might want to use'
  + ' a dispatcher instead\n  Called on: ' + show(actual)
  );
}

function invalidNamespace(m, x){
  return (
    'The Future was not created by ' + namespace + '. '
  + 'Make sure you transform other Futures to ' + namespace + ' Futures. '
  + 'Got ' + (x ? ('a Future from ' + x) : 'an unscoped Future') + '.'
  + '\n  See: https://github.com/fluture-js/Fluture#casting-futures'
  );
}

function invalidVersion(m, x){
  return (
    'The Future was created by ' + (x < version ? 'an older' : 'a newer')
  + ' version of ' + namespace + '. '
  + 'This means that one of the sources which creates Futures is outdated. '
  + 'Update this source, or transform its created Futures to be compatible.'
  + '\n  See: https://github.com/fluture-js/Fluture#casting-futures'
  );
}

export function invalidFuture(it, at, m, s){
  var id = type.parse(type(m));
  var info = id.name === name ? '\n' + (
    id.namespace !== namespace ? invalidNamespace(m, id.namespace)
  : id.version !== version ? invalidVersion(m, id.version)
  : 'Nothing seems wrong. Contact the Fluture maintainers.') : '';
  return typeError(
    it + ' expects ' + (ordinal[at] ? 'its ' + ordinal[at] + ' argument to be a valid Future' : at)
  + '.' + info + '\n  Actual: ' + show(m) + ' :: ' + id.name + (s || '')
  );
}

function indent(s){
  return '  ' + s;
}

export var captureStackTrace = Error.captureStackTrace || noop;

export function prepareRawStacktrace(e, callsites){
  return callsites;
}

export function getStacktrace(e){
  var prepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = prepareRawStacktrace;
  var callsites = e.stack;
  Error.prepareStackTrace = prepareStackTrace;
  return callsites;
}

var help =
  '\n\n  Woah. That is quite the error message you got there!' +
  '\n  The most useful information is on top. Happy debugging!\n';

export function stripHelp(s){
  return s.replace(help, '');
}

export function addHelp(s){
  return s.split('\n').length < 20 ? s : s + help;
}

export function someError(action, e, s){
  var context = typeof s === 'string' ? ':\n\n' + s.trim().split('\n').map(indent).join('\n') : '';
  try{
    var trace = (getStacktrace(e) || [])
    .filter(s => !s.isNative() && s.getFileName() && s.getLineNumber() && s.getColumnNumber())
    .slice(0, 3)
    .map(s => '\n  at ' + s.getFileName() + ':' + s.getLineNumber() + ':' + s.getColumnNumber())
    .join('');
    var errorMessage = stripHelp(
      e && e.message ? String(e.message) :
      e && typeof e.toString === 'function' ? e.toString() :
      String(e)
    );
    var message = errorMessage + '\n\nwhile ' + action + trace + context;
    var o = error(addHelp(message));
    o.name = e && e.name ? String(e.name) : 'Error';
    captureStackTrace(o, someError);
    return o;
  }catch(_){
    return error('Something came up while ' + action + ', ' +
                 'but it could not be converted to string' + context + '\n');
  }
}
