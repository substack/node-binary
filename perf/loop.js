var Seq = require('seq');
var Hash = require('traverse/hash');
var EventEmitter = require('events').EventEmitter;

var Bin = require('binary');
var Buf = require('bufferlist/binary');
var BufferList = require('bufferlist');

console.log('loop');
function emitter () {
    var em = new EventEmitter;
    process.nextTick(function () {
        for (var i = 0; i < 1000; i++) {
            var buf = new Buffer(1000);
            buf[0] = 0xff;
            em.emit('data', buf);
        }
        em.emit('data', new Buffer([0]));
    });
    return em;
}

Seq()
    .seq(function () {
        var next = this.bind({}, null);
        binary(next);
    })
    .seq(function () {
        var next = this.bind({}, null);
        bufferlist(next);
    })
;

function binary (next) {
    var em = emitter();
    var t0 = Date.now();
    Bin(em)
        .loop(function (end) {
            this
            .word8('x')
            .word8('y')
            .word32be('z')
            .word32le('w')
            .buffer('buf', 1000 - 12)
            .tap(function (vars) {
                if (vars.x === 0) {
                    var tf = Date.now();
                    console.log('    binary: ' + (tf - t0));
                    end();
                    setTimeout(next, 20);
                }
            })
        })
    ;
}

function bufferlist (next) {
    var em = emitter();
    var t0 = Date.now();
    
    var blist = new BufferList;
    em.on('data', function (buf) {
        blist.push(buf);
    });
    
    Buf(blist)
        .forever(function () {
            var top = this;
            this
            .getWord8('x')
            .getWord8('y')
            .getWord32be('z')
            .getWord32le('w')
            .getBuffer('buf', 1000 - 12)
            .tap(function (vars) {
                if (vars.x === 0) {
                    var tf = Date.now();
                    console.log('    bufferlist: ' + (tf - t0));
                    top.exit();
                    setTimeout(next, 20);
                }
            })
        })
        .end()
    ;
}
