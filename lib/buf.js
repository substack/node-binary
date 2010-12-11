module.exports = function (buf) {
    var offset = 0;
    var size = buf.length;
    
    return {
        seek : function (n) { offset += n },
        slice : function (i, j) {
            if (j === undefined) j = size - offset;
            if (i === undefined) i = 0;
            i += offset;
            j += offset;
            return i === 0 && j === size ? buf : buf.slice(i, j);
        },
        size : function () { return size - offset },
        buffer : function () { return buf },
    };
};
