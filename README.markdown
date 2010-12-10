Binary
======

Unpack multibyte binary values from buffers and streams.
You can specify the endianness and signedness of the fields to be unpacked too.

This module is a cleaner, faster, and more complete version of
[bufferlist](https://github.com/substack/node-bufferlist)'s binary module that
runs on pre-allocated buffers instead of a linked list.

Examples
========

buf.js
------
    var buf = new Buffer([ 97, 98, 99, 100, 101, 102, 0 ]);

    var Binary = require('binary');
    Binary(buf)
        .word16ls('ab')
        .word32bu('cf')
        .word8('x')
        .tap(function (vars) {
            console.dir(vars);
        })
    ;
-
    $ node buf.js
    { ab: 25185, cf: 1667523942, x: 0 }

Installation
============

To install with [npm](http://github.com/isaacs/npm):
 
    npm install binary

To run the tests with [expresso](http://github.com/visionmedia/expresso):

    expresso

Notes
=====

The word64 functions will only return approximations since javascript uses ieee
floating point for all number types. Mind the loss of precision.

Todo
====

* Actually verify that this approach is faster than bufferlist/binary.
* Add all the nifty nested parser functions without sacrificing performance.
