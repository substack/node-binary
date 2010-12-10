var Chainsaw = require('chainsaw');
var EventEmitter = require('events').EventEmitter;

module.exports = function Take (bufOrEm) {
    var active = { buf : null, offset : 0, cb : null };
    var rem = { buf : null, offset : 0 };
    
    function getBytes (bytes, cb) {
        active.buf = new Buffer(bytes);
        
        if (!rem.buf) {
            active.cb = cb;
        }
        else if (bytes === rem.buf.length - rem.offset) {
            // exactly enough data in the remainder
            cb(rem.buf.slice(rem.offset, rem.buf.length));
        }
        else if (bytes > rem.buf.length - rem.offset) {
            // more data requested than in the remainder
            rem.copy(active.buf, active.offset, rem.offset);
            active.offset += rem.length - rem.offset;
            rem = { buf : null, offset : 0 };
        }
        else {
            // less data requested than in the remainder
            var buf = rem.buf.slice(rem.offset, rem.offset + bytes);
            active.offset += rem.length;
            rem.offset += bytes;
            cb(buf);
        }
    }
    
    var em = bufOrEm instanceof EventEmitter
        ? bufOrEm : new EventEmitter;
    
    em.on('data', function (buf) {
        if (active.buf === null) {
            if (rem.buf) {
                var rbuf = new Buffer(rem.buf.length - rem.offset + buf.length);
                rem.buf.copy(rbuf, 0, rem.offset);
                buf.copy(rbuf, rem.offset, 0);
                rem = { buf : rbuf, offset : 0 };
            }
            else {
                rem = { buf : buf, offset : 0 };
            }
            active.buf
            return;
        }
        var len = active.buf.length - active.offset;
        
        if (len === buf.length) {
            if (active.offset === 0) {
                active.cb(buf);
            }
            else {
                buf.copy(active.buf, active.offset, 0);
                active.cb(active.buf);
            }
        }
        else if (len > buf.length) {
            buf.copy(active.buf, active.offset, 0);
        }
        else {
            buf.copy(active.buf, active.offset, 0, len);
            var rlen = buf.length - len;
            
            if (rem.buf && rem.buf.length > 0) {
                var rbuf = new Buffer(rlen + rem.buf.length);
                rem.buf.copy(rbuf, 0, rem.offset);
            }
            active.cb(active.buf);
        }
    });
    
    if (bufOrEm instanceof Buffer) {
        em.emit('data', bufOrEm);
    }
    
    var vars = {};
    
    return Chainsaw(function (saw) {
        var self = this;
        
        [ 1, 2, 4, 8 ].forEach(function (bytes) {
            var bits = bytes * 8;
            
            function decode (cb) {
                return function (name) {
                    getBytes(bytes, function (buf) {
                        vars[name] = cb(buf);
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
            saw.nest(cb, vars);
        };
    });
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
    var val = decodeBE(bytes);
    if ((bytes[0] & 0x80) == 0x80) {
        val -= Math.pow(256, bytes.length);
    }
    return val;
}

// convert byte strings to signed little endian numbers
function decodeLEs (bytes) {
    var val = decodeLE(bytes);
    if ((bytes[bytes.length-1] & 0x80) == 0x80) {
        val -= Math.pow(256, bytes.length);
    }
    return val;
}
