#!/usr/bin/env node
var Seq = require('seq');
var Hash = require('traverse/hash');
var small = require('./small');

var tests = {};

tests.small = function () {
    var buffers = [];
    for (var i = 0; i < 200; i++) {
        buffers.push(new Buffer(12));
    }
    
    Seq(small.bin, small.buf)
        .seqEach(function (f) {
            var t = this;
            var t0 = Date.now();
            Seq()
                .extend(buffers)
                .seqEach(function (buf) {
                    f(buf, this.bind(this, null));
                })
                .seq(function () {
                    var tf = Date.now();
                    console.log('    ' + f.name + ': ' + (tf - t0));
                    t(null);
                })
            ;
        })
        .seq(function () {
            console.log('done');
            this(null);
        })
    ;
};

Hash(tests).forEach(function (test, name) {
    console.log(name);
    test();
});
