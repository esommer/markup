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
    console.log(rulesArray);
    if (rulesArray !== undefined) {
        this.parseRules(rulesArray);
    }
};

Marker.prototype = {
    parseRules : function (rulesArray) {
        console.log('i have been called');
        var rules = new Parser(rulesArray);
        this.escapeChar = rules.escapeChar;
        if (rules.errors === '') {
            return this.escapeChar;
        }
        else {
            return rules.errors;
        }
    },
    read : function (textString) {
        var text = textString;
        return text.split('');
    },
    bindEscapes : function (textArray, rules) {
        if (this.rulesSet === true) {
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
        }
        else {
            return "bindEscapesError: No rules to follow!";
        }
    },
    bindSequences : function (textArray, rules) {

    },
    print : function (text, rules) {
        this.parseRules(rules);
        return this.bindEscapes(this.read(text));
    }
};

module.exports = Marker;
