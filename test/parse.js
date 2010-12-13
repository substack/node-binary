var Binary = require('binary');
var EventEmitter = require('events').EventEmitter;

exports.parse = function (assert) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 50);
    
    var res = Binary.parse(new Buffer([ 97, 98, 99, 1, 2, 3 ]))
        .word8('a')
        .word16be('bc')
        .buffer('def', 3)
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(vars, {
                a : 97,
                bc : 25187,
                def : new Buffer([ 1, 2, 3]),
            });
        })
        .vars
    ;
    assert.eql(res, {
        a : 97,
        bc : 25187,
        def : new Buffer([ 1, 2, 3 ]),
    });
};

exports.loop = function (assert) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 50);
    
    var res = Binary.parse(new Buffer([ 97, 98, 99, 4, 5, 2, -3, 9 ]))
        .word8('a')
        .word16be('bc')
        .loop(function (end) {
            var x = this.word8s('x').vars.x;
            if (x < 0) end();
        })
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(vars, {
                a : 97,
                bc : 25187,
                x : -3,
            });
        })
        .word8('y')
        .vars
    ;
    assert.eql(res, {
        a : 97,
        bc : 25187,
        x : -3,
        y : 9,
    });
};
