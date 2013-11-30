var Parser = require('./parser.js');

// RULE FORMAT:
// {
    // chars: 'chars',
    // endchars: 'chars',
    // name: 'name',
    // type: 'singleton/containing/complex/escape',
    // start: '<html>',
    // end: '</html>',
    // html: '<hr>'
// }

var Marker = function (rulesArray) {
    this.rulesSet = false;
    this.escapeChar = '';
    this.containers = [];
    this.maxLength = 0;
    this.triggers = [];
    if (rulesArray !== undefined) {
        this.parseRules(rulesArray);
    }
};

Marker.prototype = {
    parseRules : function (rulesArray) {
        var rules = new Parser();
        rules.readRules(rulesArray);
        if (rules.errors === '') {
            this.escapeChar = rules.escapeChar;
            this.containers = rules.sortContainers(rules.containers);
            this.rulesSet = true;
        }
        else {
            return rules.errors;
        }
    },
    clean : function (textString) {
        var text = textString;
        return text.replace(/\r/g,'\n');
    },
    read : function (textString) {
        var text = textString;
        return text.split('');
    },
    bindEscapes : function (textArray) {
        if (this.escapeChar === '') return "bindEscapes: No rules to follow!";
        var returnArr = [];
        var accumulator = '';
        textArray.forEach(function(token) {
            if (accumulator !== '') {
                returnArr.push(accumulator + token);
                accumulator = '';
            }
            else if (token === this.escapeChar) {
                accumulator = token;
            }
            else {
                returnArr.push(token);
            }
        }, this);
        return returnArr;
    },
    setMaxLength : function () {
        this.maxLength = this.containers.reduce(function(longest, current){
            return current.length > longest ? current.length : longest;
        }, 0);
        return this.maxLength;
    },
    setTriggers : function () {
        this.triggers = this.containers.map(function(item){
            return item[0];
        });
        return this.triggers;
    },
    inArray : function (item, arr) {
        for (var i=0; i<arr.length; i++) {
            if (item === arr[i]) return i;
        }
    },
    chunkOnEscapes : function (textArray, result) {
        if (textArray.length === 0) return result;
        var broken = [];
        var piece = '';
        for (var i=0; i<textArray.length; i++) {
            var token = textArray[i];
            if (token[0] !== this.escapeChar) {
                piece += token;
            }
            else {
                broken.push(piece);
                broken.push(token);
                piece = '';
            }
        }
        broken.push(piece);
        return broken;
    },
    regexify : function (chunkedArray) {
        var output = [];
        for (i=0; i<chunkedArray.length; i++) {
            if (chunkedArray[i][0] !== '~') {
                var regExpChars = ['*','?','|','\\','/','.','$','^'];
                var self = this;
                var chunks = [];
                var result = this.containers.reduce(function(last, current) {
                    var fixed = current.split('').map(function(character) {
                        if (self.inArray(character, regExpChars) !== undefined) {
                            var better = "\\" + character;
                            return better;
                        }
                        return character;
                    },this).join('');
                    var regexp = new RegExp(fixed, 'g');
                    var index = last.search(regexp);
                    if (index !== -1) {
                        var arr = last.split(regexp,1);
                        chunks.push(arr[0]);
                        chunks.push(arr[1]);
                    }
                    var next = '';
                    return next;
                }, chunkedArray[i]);
                output.push(result);
            }
            else {
                output.push(chunkedArray[i]);
            }
        }
        // var result = chunkedArray.forEach(function (chunk) {
        //     this.containers.map(function (chars) {
        //         var blah = chunk.replace(chars,'!!!');
        //         console.log(blah);
        //         return blah;
        //     })
        // }, this);
        return result;
    },
    bindSequences : function (textArray) {
        if (this.containers === []) return "bindSequences: No rules to follow!";
        this.setMaxLength();
        this.setTriggers();
        return this.regexify(this.chunkOnEscapes(textArray));
        // var bound = [];
        // var stack = [];
        // var possibles = [];
        // var acc = '';
        // textArray.forEach(function(token) {
        //     if (stack !== [] && token === stack[stack.length-1]) {
        //         acc += token;
        //     }
        //     else if (this.inArray(token, this.triggers) !== undefined) {
        //         possibles = this.containers.map(function(val) {
        //             console.log(val[0]);
        //             if (val[0] === token) return val;
        //         },this);
        //         stack.push(token);
        //         acc += token;
        //     }
        //     else {
        //         bound.push(token);
        //     }
        // }, this);
        //return possibles;
    },
    print : function (text, rules) {
        this.parseRules(rules);
        return this.bindEscapes(this.read(text));
    }
};

module.exports = Marker;
