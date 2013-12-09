// Array helper functions
var arrFxns = {
    last : function () {
        return this[this.length - 1];
    },
    inArray : function (item) {
        for (var i=0; i<this.length; i++) {
            if (item === this[i]) return true;
        }
    },
    fetchObjByKeyVal : function (keyName, val) {
        for (var i=0; i<this.length; i++) {
            if (this[i][keyName] === val) return this[i];
        }
    },
    filterByCharAtVal : function (charIndex, matchChar) {
        var output = this.filter(function(val, ind) {
            if (val[charIndex] === matchChar) return val;
        });
        return output;
    }
};

Object.keys(arrFxns).forEach(function (keyName) {
    Array.prototype[keyName] = arrFxns[keyName];
})

module.exports = Array;
