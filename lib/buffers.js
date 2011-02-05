module.exports = function () {
    var offset = 0;
    var buffers = [];
    
    var self = { ready : 0 };
    
    self.seek = function (n) {
        offset += n;
        while (buffers.length > 0 && offset > buffers[0].length) {
            offset -= buffers[0].length;
            self.ready -= buffers[0].length;
            buffers.shift();
        }
    };
    
    self.push = function (buf) {
        buffers.push(buf);
        self.ready += buf.length;
    };
    
    self.slice = function (i, j) {
        if (j === undefined) j = self.ready - offset;
        if (i === undefined) i = 0;
        i += offset; j += offset;
        
        if (j > self.ready) {
            throw new Error('Index ' + j + ' out of bounds');
        }
        
        var target = new Buffer(j - i);
        var ti = 0, total = 0;
        
        for (var k = 0; k < buffers.length; k++) {
            var buf = buffers[k];
            
            if (ti >= j - i) break;
            
            if (total + buf.length >= i) {
                if (ti === 0) { // first matching buffer
                    buf.copy(
                        target, ti, i - total,
                        Math.min(buf.length, j - i + 1)
                    );
                    ti += Math.min(buf.length, j - i + 1) - (i - total);
                }
                else {
                    buf.copy(
                        target, ti, 0,
                        Math.min(buf.length, j - total)
                    );
                    ti += Math.min(buf.length, j - total);
                }
            }
            
            total += buf.length;
        }
        
        return target;
    };
    
    return self;
};
