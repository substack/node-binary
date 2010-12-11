var Seq = require('seq');
var Hash = require('traverse/hash');
var EventEmitter = require('events').EventEmitter;

var Bin = require('binary');
var Buf = require('bufferlist/binary');
var BufferList = require('bufferlist');

console.log('loop');
function emitter () {
    var em = new EventEmitter;
    
    var i = 0;
    var iv = setInterval(function () {
        var buf = new Buffer(1000);
        buf[0] = 0xff;
        
        if (++ i >= 1000) {
            buf[0] = 0;
            clearInterval(iv);
        }
        em.emit('data', buf);
    }, 1);
    
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
    var loops = 0;
    Bin(em)
        .loop(function (end) {
            this
            .word8('x')
            .word8('y')
            .word32be('z')
            .word32le('w')
            .buffer('buf', 1000 - 10)
            .tap(function (vars) {
                loops ++;
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
            .getBuffer('buf', 1000 - 10)
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
