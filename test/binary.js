var Binary = require('binary');
var EventEmitter = require('events').EventEmitter;

exports.buffer = function (assert) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 50);
    
    Binary(new Buffer([ 97, 98, 99 ]))
        .word8('a')
        .word16be('bc')
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(vars, { a : 97, bc : 25187 });
        })
    ;
};

exports.immediate = function (assert) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 50);
    
    var em = new EventEmitter;
    Binary(em)
        .word8('a')
        .word16be('bc')
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(vars, { a : 97, bc : 25187 });
        })
    ;
    
    em.emit('data', new Buffer([ 97, 98, 99 ]));
};

exports.deferred = function (assert) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 50);
    
    var em = new EventEmitter;
    Binary(em)
        .word8('a')
        .word16be('bc')
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(vars, { a : 97, bc : 25187 });
        })
    ;
    
    setTimeout(function () {
        em.emit('data', new Buffer([ 97, 98, 99 ]));
    }, 10);
};

exports.split = function (assert) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 50);
    
    var em = new EventEmitter;
    Binary(em)
        .word8('a')
        .word16be('bc')
        .word32ls('x')
        .word32bs('y')
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(vars, {
                a : 97,
                bc : 25187,
                x : 621609828,
                y : 621609828,
            });
        })
    ;
    
    em.emit('data', new Buffer([ 97, 98 ]));
    setTimeout(function () {
        em.emit('data', new Buffer([ 99, 100 ]));
    }, 25);
    setTimeout(function () {
        em.emit('data', new Buffer([ 3, 13, 37, 37 ]));
    }, 30);
    setTimeout(function () {
        em.emit('data', new Buffer([ 13, 3, 100 ]));
    }, 40);
};

exports.posls = function (assert) {
};

exports.negls = function (assert) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 50);
    
    // note: can't store -12667700813876161 exactly in an ieee float
    
    var buf = new Buffer([
        226, // a == -30
        219, 246, // b == -2341
        236, 245, 243, 255, // c == -789012
        63, 52, 222, 16, 203, 254, 210, 255, // d == -12667700813876161
    ]);
    
    Binary(buf)
        .word8ls('a')
        .word16ls('b')
        .word32ls('c')
        .word64ls('d')
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(vars.a, -30);
            assert.eql(vars.b, -2341);
            assert.eql(vars.c, -789012);
            assert.ok(
                Math.abs(vars.d - -12667700813876161) < 1000
            );
        })
    ;
};
