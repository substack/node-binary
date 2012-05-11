var Binary = require('../');
var test = require('tap').test;

test('builder', function (t) {
    t.plan(1);
    var buf = Binary.put()
        .word16be(1337)
        .put(new Buffer([ 7, 8, 9 ]))
        .buffer()
    ;
    t.same(
        [].slice.call(buf),
        [].slice.call(new Buffer([ 0x05, 0x39, 0x07, 0x08, 0x09 ]))
    );
});
