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
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 50);
    
    // note: can't store 12667700813876161 exactly in an ieee float
    
    var buf = new Buffer([
        30, // a == -30
        37, 9, // b == -2341
        20, 10, 12, 0, // c == -789012
        193, 203, 33, 239, 52, 1, 45, 0, // d == 12667700813876161
    ]);
    
    Binary(buf)
        .word8ls('a')
        .word16ls('b')
        .word32ls('c')
        .word64ls('d')
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(vars.a, 30);
            assert.eql(vars.b, 2341);
            assert.eql(vars.c, 789012);
            assert.ok(
                Math.abs(vars.d - 12667700813876161) < 1000
            );
        })
    ;
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

exports.posbs = function (assert) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 50);
    
    // note: can't store 12667700813876161 exactly in an ieee float
    
    var buf = new Buffer([
        30, // a == -30
        9, 37, // b == -2341
        0, 12, 10, 20, // c == -789012
        0, 45, 1, 52, 239, 33, 203, 193, // d == 12667700813876161
    ]);
    
    Binary(buf)
        .word8bs('a')
        .word16bs('b')
        .word32bs('c')
        .word64bs('d')
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(vars.a, 30);
            assert.eql(vars.b, 2341);
            assert.eql(vars.c, 789012);
            assert.ok(
                Math.abs(vars.d - 12667700813876161) < 1000
            );
        })
    ;
};

exports.negbs = function (assert) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 50);
    
    // note: can't store -12667700813876161 exactly in an ieee float
    
    var buf = new Buffer([
        226, // a == -30
        246, 219, // b == -2341
        255, 243, 245, 236, // c == -789012
        255, 210, 254, 203, 16, 222, 52, 63, // d == -12667700813876161
    ]);
    
    Binary(buf)
        .word8bs('a')
        .word16bs('b')
        .word32bs('c')
        .word64bs('d')
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(vars.a, -30);
            assert.eql(vars.b, -2341);
            assert.eql(vars.c, -789012);
            assert.ok(
                Math.abs(vars.d - -12667700813876161) < 1500
            );
        })
    ;
};

exports.lu = function (assert) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 50);
    
    // note: can't store -12667700813876161 exactly in an ieee float
    
    var buf = new Buffer([
        44, // a == 44
        43, 2, // b == 555
        37, 37, 213, 164, // c == 2765432101
        193, 203, 115, 155, 20, 180, 81, 29, // d == 2112667700813876161
    ]);
    
    Binary(buf)
        .word8lu('a')
        .word16lu('b')
        .word32lu('c')
        .word64lu('d')
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(vars.a, 44);
            assert.eql(vars.b, 555);
            assert.eql(vars.c, 2765432101);
            assert.ok(
                Math.abs(vars.d - 2112667700813876161) < 1500
            );
        })
    ;
    
    // also check aliases here:
    Binary(buf)
        .word8le('a')
        .word16le('b')
        .word32le('c')
        .word64le('d')
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(vars.a, 44);
            assert.eql(vars.b, 555);
            assert.eql(vars.c, 2765432101);
            assert.ok(
                Math.abs(vars.d - 2112667700813876161) < 1500
            );
        })
    ;
};

exports.bu = function (assert) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 50);
    
    // note: can't store -12667700813876161 exactly in an ieee float
    
    var buf = new Buffer([
        44, // a == 44
        2, 43, // b == 555
        164, 213, 37, 37, // c == 2765432101
        29, 81, 180, 20, 155, 115, 203, 193, // d == 2112667700813876161
    ]);
    
    Binary(buf)
        .word8bu('a')
        .word16bu('b')
        .word32bu('c')
        .word64bu('d')
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(vars.a, 44);
            assert.eql(vars.b, 555);
            assert.eql(vars.c, 2765432101);
            assert.ok(
                Math.abs(vars.d - 2112667700813876161) < 1500
            );
        })
    ;
    
    // also check aliases here:
    Binary(buf)
        .word8be('a')
        .word16be('b')
        .word32be('c')
        .word64be('d')
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(vars.a, 44);
            assert.eql(vars.b, 555);
            assert.eql(vars.c, 2765432101);
            assert.ok(
                Math.abs(vars.d - 2112667700813876161) < 1500
            );
        })
    ;
};
