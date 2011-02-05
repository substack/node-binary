var assert = require('assert');
var Buffers = require('../lib/buffers.js');

exports.slice = function () {
    var bufs = Buffers();
    bufs.push(new Buffer([0,1,2,3]));
    bufs.push(new Buffer([4,5]));
    bufs.push(new Buffer([6,7,8]));
    bufs.push(new Buffer([9]));
    var xs = [0,1,2,3,4,5,6,7,8,9];
    for (var i = 0; i < xs.length; i++) {
        for (var j = i; j < xs.length; j++) {
            console.log([ i, j ]);
            assert.eql(
                bufs.slice(i,j),
                new Buffer(xs.slice(i,j))
            );
        }
    }
};
