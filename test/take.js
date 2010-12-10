var Take = require('take');
var EventEmitter = require('events').EventEmitter;

exports.buffer = function (assert) {
    var to = setTimeout(function () {
        assert.fail('never tapped');
    }, 50);
    
    Take(new Buffer([ 97, 98, 99 ]))
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
    Take(em)
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
    Take(em)
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
    Take(em)
        .word8('a')
        .word16be('bc')
        .tap(function (vars) {
            clearTimeout(to);
            assert.eql(vars, { a : 97, bc : 25187 });
        })
    ;
    
    em.emit('data', new Buffer([ 97, 98 ]));
    setTimeout(function () {
        em.emit('data', new Buffer([ 99, 100 ]));
    }, 25);
};
