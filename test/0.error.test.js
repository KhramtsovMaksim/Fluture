import {eq, eeq} from './util';
import {namespace, name, version} from '../src/internal/const';
import {
  error,
  typeError,
  invalidArgument,
  invalidContext,
  invalidFuture,
  someError
} from '../src/internal/error';

describe('error', function (){

  describe('error', function (){

    it('constructs an Error', function (){
      eq(error('hello'), new Error('hello'));
    });

  });

  describe('typeError', function (){

    it('constructs a TypeError', function (){
      eq(typeError('hello'), new TypeError('hello'));
    });

  });

  describe('invalidArgument', function (){

    it('constructs a TypeError', function (){
      eq(invalidArgument('Test', 1, 'foo', 'bar'), new TypeError(
        'Test expects its second argument to foo\n  Actual: "bar"'
      ));
    });

  });

  describe('invalidContext', function (){

    it('constructs a TypeError', function (){
      eq(invalidContext('Test', 'foo'), new TypeError(
        'Test was invoked outside the context of a Future. You might want ' +
        'to use a dispatcher instead\n  Called on: "foo"'
      ));
    });

  });

  describe('invalidFuture', function (){

    var mockType = function (identifier){
      return {'constructor': {'@@type': identifier}, '@@show': function (){
        return 'mockType("' + identifier + '")';
      }};
    };

    it('creates a TypeError with a computed message', function (){
      var actual = invalidFuture(
        'Deep Thought', 'the answer to be 42', 43,
        '\n  See: https://en.wikipedia.org/wiki/Off-by-one_error'
      );
      eq(actual, new TypeError(
        'Deep Thought expects the answer to be 42.\n  Actual: 43 :: Number\n' +
        '  See: https://en.wikipedia.org/wiki/Off-by-one_error'
      ));
    });

    it('warns us when nothing seems wrong', function (){
      var actual = invalidFuture('Foo', 0, mockType(namespace + '/' + name + '@' + version));
      eq(actual, new TypeError(
        'Foo expects its first argument to be a valid Future.\n' +
        'Nothing seems wrong. Contact the Fluture maintainers.\n' +
        '  Actual: mockType("fluture/Future@4") :: Future'
      ));
    });

    it('Warns us about Futures from other sources', function (){
      var actual = invalidFuture('Foo', 0, mockType('bobs-tinkershop/' + name + '@' + version));
      eq(actual, new TypeError(
        'Foo expects its first argument to be a valid Future.\n' +
        'The Future was not created by fluture. ' +
        'Make sure you transform other Futures to fluture Futures. ' +
        'Got a Future from bobs-tinkershop.\n' +
        '  See: https://github.com/fluture-js/Fluture#casting-futures\n' +
        '  Actual: mockType("bobs-tinkershop/Future@4") :: Future'
      ));
    });

    it('Warns us about Futures from unnamed sources', function (){
      var actual = invalidFuture('Foo', 0, mockType(name));
      eq(actual, new TypeError(
        'Foo expects its first argument to be a valid Future.\n' +
        'The Future was not created by fluture. ' +
        'Make sure you transform other Futures to fluture Futures. ' +
        'Got an unscoped Future.\n' +
        '  See: https://github.com/fluture-js/Fluture#casting-futures\n' +
        '  Actual: mockType("Future") :: Future'
      ));
    });

    it('Warns about older versions', function (){
      var actual = invalidFuture('Foo', 0, mockType(namespace + '/' + name + '@' + (version - 1)));
      eq(actual, new TypeError(
        'Foo expects its first argument to be a valid Future.\n' +
        'The Future was created by an older version of fluture. ' +
        'This means that one of the sources which creates Futures is outdated. ' +
        'Update this source, or transform its created Futures to be compatible.\n' +
        '  See: https://github.com/fluture-js/Fluture#casting-futures\n' +
        '  Actual: mockType("fluture/Future@3") :: Future'
      ));
    });

    it('Warns about newer versions', function (){
      var actual = invalidFuture('Foo', 0, mockType(namespace + '/' + name + '@' + (version + 1)));
      eq(actual, new TypeError(
        'Foo expects its first argument to be a valid Future.\n' +
        'The Future was created by a newer version of fluture. ' +
        'This means that one of the sources which creates Futures is outdated. ' +
        'Update this source, or transform its created Futures to be compatible.\n' +
        '  See: https://github.com/fluture-js/Fluture#casting-futures\n' +
        '  Actual: mockType("fluture/Future@5") :: Future'
      ));
    });

  });

  describe('someError', function (){

    it('produces an error', function (){
      eq(someError('testing', new Error('It broke')) instanceof Error, true);

      eq(someError('testing', new Error('It broke')).name, 'Error');
      eq(someError('testing', new TypeError('It broke')).name, 'TypeError');

      eeq(someError('testing', new Error('It broke')), 'It broke\n\nwhile testing');

      eeq(someError('testing', 'It broke'), 'It broke\n\nwhile testing');
      eeq(someError('testing', {toString: false}), 'Something came up while testing, but it could not be converted to string\n');
      eeq(someError('testing', 'It broke', 'extra'), 'It broke\n\nwhile testing:\n\n  extra');
    });

  });

});
