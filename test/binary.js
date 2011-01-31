var Binary = require('binary');
var EventEmitter = require('events').EventEmitter;
var Seq = require('seq');

exports.fromBuffer = function (assert) {
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

exports.dots = function (assert) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 50);
    
    Binary.parse(new Buffer([ 97, 98, 99, 100, 101, 102 ]))
        .word8('a')
        .word16be('b.x')
        .word16be('b.y')
        .word8('b.z')
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(vars, {
                a : 97,
                b : {
                    x : 256 * 98 + 99,
                    y : 256 * 100 + 101,
                    z : 102
                },
            });
        })
    ;
};

exports.flush = function (assert) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 50);
    
    Binary.parse(new Buffer([ 97, 98, 99, 100, 101, 102 ]))
        .word8('a')
        .word16be('b')
        .word16be('c')
        .flush()
        .word8('d')
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(vars, { d : 102 });
        })
    ;
};

exports.immediate = function (assert) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 50);
    
    var em = new EventEmitter;
    Binary.stream(em, 'moo')
        .word8('a')
        .word16be('bc')
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(vars, { a : 97, bc : 25187 });
        })
    ;
    
    em.emit('moo', new Buffer([ 97, 98, 99 ]));
};

exports.deferred = function (assert) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 50);
    
    var em = new EventEmitter;
    Binary.stream(em)
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
    Binary.stream(em)
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
    
    Binary.parse(buf)
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
    
    Binary.parse(buf)
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
    
    Binary.parse(buf)
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
    
    Binary.parse(buf)
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
    
    Binary.parse(buf)
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
    Binary.parse(buf)
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
    
    Binary.parse(buf)
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
    Binary.parse(buf)
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

exports.loop = function (assert) {
    var em = new EventEmitter;
    var times = 0;
    var to = setTimeout(function () {
        assert.fail('loop never terminated');
    }, 500);
    
    Binary.stream(em)
        .loop(function (end) {
            this
                .word16lu('a')
                .word8u('b')
                .word8s('c')
                .tap(function (vars) {
                    times ++;
                    if (vars.c < 0) end();
                })
            ;
        })
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(vars, { a : 1337, b : 55, c : -5 });
            assert.eql(times, 4);
        })
    ;
    
    setTimeout(function () {
        em.emit('data', new Buffer([ 2, 10, 88 ]));
    }, 10);
    setTimeout(function () {
        em.emit('data', new Buffer([ 100, 3, 6, 242, 30 ]));
    }, 20);
    setTimeout(function () {
        em.emit('data', new Buffer([ 60, 60, 199, 44 ]));
    }, 30);
    
    setTimeout(function () {
        em.emit('data', new Buffer([ 57, 5 ]));
    }, 80);
    setTimeout(function () {
        em.emit('data', new Buffer([ 55, 251 ]));
    }, 90);
};

exports.getBuffer = function (assert) {
    var t1 = setTimeout(function () {
        assert.fail('first buffer never finished');
    }, 20);
    
    var t2 = setTimeout(function () {
        assert.fail('second buffer never finished');
    }, 20);
    
    var buf = new Buffer([ 4, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ]);
    Binary.parse(buf)
        .word8('a')
        .buffer('b', 7)
        .word16lu('c')
        .tap(function (vars) {
            clearTimeout(t1);
            assert.eql(vars, {
                a : 4, 
                b : new Buffer([ 2, 3, 4, 5, 6, 7, 8 ]),
                c : 2569,
            });
        })
        .buffer('d', 'a')
        .tap(function (vars) {
            clearTimeout(t2);
            assert.eql(vars.d, new Buffer([ 11, 12, 13, 14 ]));
        })
    ;
};

exports.interval = function (assert) {
    var to = setTimeout(function () {
        assert.fail('loop populated by interval never finished');
    }, 5000);
    
    var em = new EventEmitter;
    var i = 0;
    var iv = setInterval(function () {
        var buf = new Buffer(1000);
        buf[0] = 0xff;
        if (++i >= 1000) {
            clearInterval(iv);
            buf[0] = 0;
        }
        em.emit('data', buf);
    }, 1);
    
    var loops = 0;
    Binary(em)
        .loop(function (end) {
            this
            .word8('x')
            .word8('y')
            .word32be('z')
            .word32le('w')
            .buffer('buf', 1000 - 10)
            .tap(function (vars) {
                loops ++;
                if (vars.x == 0) end();
            })
        })
        .tap(function () {
            clearTimeout(to);
            assert.eql(loops, 1000);
        })
    ;
};

exports.skip = function (assert) {
    var to = setTimeout(function () {
        assert.fail('Never finished');
    }, 1000);
    
    var em = new EventEmitter;
    var state = 0;
    
    Binary(em)
        .word16lu('a')
        .tap(function () { state = 1 })
        .skip(7)
        .tap(function () { state = 2 })
        .word8('b')
        .tap(function () { state = 3 })
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(state, 3);
            assert.eql(vars, {
                a : 2569,
                b : 8,
            });
        })
    ;
    
    Seq()
        .seq(setTimeout, Seq, 20)
        .seq(function () {
            assert.eql(state, 0);
            em.emit('data', new Buffer([ 9 ]));
            this(null);
        })
        .seq(setTimeout, Seq, 5)
        .seq(function () {
            assert.eql(state, 0);
            em.emit('data', new Buffer([ 10, 1, 2 ]));
            this(null);
        })
        .seq(setTimeout, Seq, 30)
        .seq(function () {
            assert.eql(state, 1);
            em.emit('data', new Buffer([ 3, 4, 5 ]));
            this(null);
        })
        .seq(setTimeout, Seq, 15)
        .seq(function () {
            assert.eql(state, 1);
            em.emit('data', new Buffer([ 6, 7 ]));
            this(null);
        })
        .seq(function () {
            assert.eql(state, 2);
            em.emit('data', new Buffer([ 8 ]));
            this(null);
        })
    ;
};
