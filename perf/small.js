var Bin = require('binary');
var Buf = require('bufferlist/binary');
var BufferList = require('bufferlist');

exports.bin = function binary (buf, cb) {
    Bin(buf)
        .word32le('x')
        .word16be('y')
        .word16be('z')
        .word32le('w')
        .tap(cb)
    ;
};

exports.buf = function bufferlist (buf, cb) {
    var blist = new BufferList;
    blist.push(buf);
    Buf(blist)
        .getWord32le('x')
        .getWord16be('y')
        .getWord16be('z')
        .getWord32le('w')
        .tap(cb)
        .end()
    ;
};
