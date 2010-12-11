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

stream.js
---------

    var Binary = require('binary');
    var stdin = process.openStdin();
    
    Binary(stdin)
        .word32lu('x')
        .word16bs('y')
        .word16bu('z')
        .tap(function (vars) {
            console.dir(vars);
        })
    ;
-
    $ node examples/stream.js
    abcdefgh
    { x: 1684234849, y: 25958, z: 26472 }
    ^D

Methods
=======

Binary(buf)
-----------

Start a new chain parser for a `Buffer`.

Binary(emitter)
---------------
Binary(emitter, eventName='data')
---------------------------------

Start a new chain parser for an `EventEmitter` for an event name `eventName`,
which defaults to `'data'`.

word{8,16,32,64}{l,b}{e,u,s}(name)
----------------------------------

Parse bytes in the buffer or stream given:

* number of bits
* endianness ( l : little, b : big ),
* signedness ( u and e : unsigned, s : signed )

These functions won't start parsing until all previous parser functions have run
and the data is available.

The result of the parse goes into the variable stash at `name`.

buffer(key, size)
-----------------

Take `size` bytes directly off the buffer stream, putting the resulting buffer
slice in the variable stash at `key`. If `size` is a string, use the value at
`vars[size]`.

tap(cb)
-------

The callback `cb` is provided with the variable stash from all the previous
actions once they've all finished.

loop(cb)
--------

Loop, each time calling `cb(end, vars)` for function `end` and the variable
stash with `this` set to a new chain for nested parsing. The loop terminates
once `end` is called.

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
