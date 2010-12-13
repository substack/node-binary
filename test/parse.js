var Binary = require('binary');
var EventEmitter = require('events').EventEmitter;

exports.parse = function (assert) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 50);
    
    var res = Binary.parse(new Buffer([ 97, 98, 99 ]))
        .word8('a')
        .word16be('bc')
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(vars, { a : 97, bc : 25187 });
        })
        .vars
    ;
    assert.eql(res, { a : 97, bc : 25187 });
};
