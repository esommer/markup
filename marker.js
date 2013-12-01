var Parser = require('./parser.js');
var Array = require('./arrFxns.js');

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
    this.rules = [];
    this.output = '';
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
            this.rules = rules.rules;
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
    addToOutput : function (rule, close) {
        var toStack;
        switch (rule.type) {
            case ('containing'):
                if (close === true) {
                    this.output += rule.end;
                }
                else {
                    this.output += rule.start;
                    toStack = rule.chars;
                }
                break;
            default:
                break;
        }
        return toStack;
    },
    bindSequences : function (textArray, dev) {
        if (this.containers === []) return "bindSequences: No rules to follow!";
        var openStack = [];
        var subset = this.containers;
        var searchString = '';
        var charNum = 0;
        textArray.forEach(function(token) {
            subset = subset.filterByCharAtVal(charNum, token);
            searchString += token;
            if (dev) {
                console.log('\n\t');
                console.log('NEXT CYCLE: searchString:' + searchString + '; charNum: ' + charNum + "; openStack last: " + openStack.last());
            }
            if (subset.length === 1 && searchString === subset[0]) {
                    var rule = this.rules.fetchObjByKeyVal('chars', searchString);
                    var close = openStack.last() === searchString ? true : false;
                    var open = this.addToOutput.call(this, rule, close);
                    if (open) openStack.push(open);
                    if (close) openStack.pop();
                    searchString = '';
                    charNum = 0;
            }
            else if (subset.length > 0) {
                charNum ++;
            }
            else if (subset.length === 0 && searchString.length > 1) {
                var ruleChars = searchString.slice(0, searchString.length - 1);
                var rule = this.rules.fetchObjByKeyVal('chars', ruleChars);
                if (rule !== undefined) {
                    var close = openStack.last() === ruleChars ? true : false;
                    var open = this.addToOutput.call(this, rule, close);
                    this.output += token;
                    if (open) openStack.push(open);
                    if (close) openStack.pop();
                    searchString = '';
                    charNum = 0;
                }
                else {
                    console.log('ERROR');
                }
            }
            else {
                this.output += token;
                charNum = 0;
                searchString = '';
                subset = this.containers;
            }
        }, this);
        if (searchString !== '') {
            var rule = this.rules.fetchObjByKeyVal('chars', searchString);
            if (rule !== undefined) {
                var close = openStack.last() === searchString ? true : false;
                var open = this.addToOutput.call(this, rule, close);
                if (open) openStack.push(open);
                if (close) openStack.pop();
                searchString = '';
                charNum = 0;
            }
            else {
                console.log('mystery');
            }
        }
        return this.output;
    },
    print : function (text, rules) {
        this.parseRules(rules);
        return this.bindEscapes(this.read(text));
    }
};

module.exports = Marker;
