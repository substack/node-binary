var Chainsaw = require('chainsaw');

module.exports = function Take (buf) {
    var offset = 0;
    var vars = {};
    
    return Chainsaw(function (saw) {
        var self = this;
        
        [ 1, 2, 4, 8 ].forEach(function (bytes) {
            var bits = bytes * 8;
            
            function decode (cb) {
                return function (name) {
                    vars[name] = cb(buf.slice(offset, bytes));
                    offset += bytes;
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
            cb(vars);
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
