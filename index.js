var Chainsaw = require('chainsaw');
var EventEmitter = require('events').EventEmitter;
var Buf = require('./lib/buf.js');
var Vars = require('./lib/vars.js');

module.exports = function (bufOrEm, eventName) {
    if (eventName === undefined) eventName = 'data';
    
    var em = bufOrEm instanceof EventEmitter
        ? bufOrEm : new EventEmitter;
    
    if (bufOrEm instanceof Buffer) {
        process.nextTick(function () {
            em.emit(eventName, bufOrEm);
        });
    }
    
    var pending = null;
    function getBytes (bytes, cb) {
        pending = {
            bytes : bytes,
            size : bytes,
            cb : function (buf) {
                pending = null;
                cb(buf);
            }
        };
        dispatch();
    }
     
    var active = null;
    em.on(eventName, function (buf) {
        active = Buf(buf);
        dispatch();
    });
    
    function dispatch () {
        if (!active) return;
        if (!pending) return;
        
        var asize = active.size();
        var rem = pending.size - pending.bytes;
        
        if (asize === pending.bytes) {
            var buf = active.slice();
            active = null;
            
            if (pending.buffer) {
                buf.copy(pending.buffer, rem, 0);
                pending.cb(pending.buffer);
            }
            else {
                pending.cb(buf);
            }
        }
        else if (asize > pending.bytes) {
            var buf = active.slice(0, pending.bytes);
            active.seek(pending.bytes);
            if (pending.buffer) {
                buf.copy(pending.buffer, rem, 0, pending.bytes);
                pending.cb(pending.buffer);
            }
            else {
                pending.cb(buf);
            }
        }
        else if (asize < pending.bytes) {
            if (!pending.buffer) {
                pending.buffer = new Buffer(pending.size);
            }
            active.slice().copy(pending.buffer, rem, 0);
            pending.bytes -= asize;
            active = null;
        }
    }
    
    var vars = Vars();
    
    return Chainsaw(function builder (saw) {
        var self = this;
        
        [ 1, 2, 4, 8 ].forEach(function (bytes) {
            var bits = bytes * 8;
            
            function decode (cb) {
                return function (name) {
                    getBytes(bytes, function (buf) {
                        vars.set(name, cb(buf));
                        saw.next();
                    });
                };
            }
            
            self['word' + bits + 'le']
            = self['word' + bits + 'lu']
            = decode(decodeLEu);
            
            self['word' + bits + 'ls']
            = decode(decodeLEs);
            
            self['word' + bits + 'be']
            = self['word' + bits + 'bu']
            = decode(decodeBEu);
            
            self['word' + bits + 'bs']
            = decode(decodeBEs);
        });
        
        // word8be(n) == word8le(n) for all n
        self.word8 = self.word8u = self.word8be;
        self.word8s = self.word8bs;
        
        self.tap = function (cb) {
            saw.nest(cb, vars.store);
        };
        
        self.flush = function () {
            vars.store = {};
            saw.next();
        };
        
        self.loop = function loop (cb) {
            var s = Chainsaw.saw(builder, {});
            
            var end = false;
            s.on('end', function () {
                if (end) saw.next();
                else self.loop(cb);
            });
            
            var r = builder.call(s.handlers, s);
            if (r !== undefined) s.handlers = r;
            
            cb.call(s.chain(), function () { end = true }, vars.store);
        };
        
        self.buffer = function (name, size) {
            if (typeof size === 'string') {
                size = vars.get(size);
            }
            
            getBytes(size, function (buf) {
                vars.set(name, buf);
                saw.next();
            });
        };
    });
};

module.exports.parse = function parse (buffer, offset) {
    if (offset === undefined) offset = 0;
    var vars = Vars();
    var self = { vars : vars.store };
    
    [ 1, 2, 4, 8 ].forEach(function (bytes) {
        var bits = bytes * 8;
        
        function decode (cb) {
            return function (name) {
                var buf = buffer.slice(offset, offset + bytes);
                offset += bytes;
                vars.set(name, cb(buf));
                return self;
            };
        }
        
        self['word' + bits + 'le']
        = self['word' + bits + 'lu']
        = decode(decodeLEu);
        
        self['word' + bits + 'ls']
        = decode(decodeLEs);
        
        self['word' + bits + 'be']
        = self['word' + bits + 'bu']
        = decode(decodeBEu);
        
        self['word' + bits + 'bs']
        = decode(decodeBEs);
    });
    
    // word8be(n) == word8le(n) for all n
    self.word8 = self.word8u = self.word8be;
    self.word8s = self.word8bs;
    
    self.tap = function (cb) {
        cb.call(parse(buffer, offset), vars.store);
        return self;
    };
    
    return self;
};

// convert byte strings to unsigned little endian numbers
function decodeLEu (bytes) {
    var acc = 0;
    for (var i = 0; i < bytes.length; i++) {
        acc += Math.pow(256,i) * bytes[i];
    }
    return acc;
}

// convert byte strings to unsigned big endian numbers
function decodeBEu (bytes) {
    var acc = 0;
    for (var i = 0; i < bytes.length; i++) {
        acc += Math.pow(256, bytes.length - i - 1) * bytes[i];
    }
    return acc;
}

// convert byte strings to signed big endian numbers
function decodeBEs (bytes) {
    var val = decodeBEu(bytes);
    if ((bytes[0] & 0x80) == 0x80) {
        val -= Math.pow(256, bytes.length);
    }
    return val;
}

// convert byte strings to signed little endian numbers
function decodeLEs (bytes) {
    var val = decodeLEu(bytes);
    if ((bytes[bytes.length - 1] & 0x80) == 0x80) {
        val -= Math.pow(256, bytes.length);
    }
    return val;
}
