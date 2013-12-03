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
    this.matchChars = [];
    this.rules = [];
    this.output = '';
    this.stateVars = {
        openStack : [],
        subset : this.matchChars,
        searchString : '',
        charNum : 0
    };
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
            this.matchChars = rules.matchChars;
            this.rules = rules.rules;
            this.rulesSet = true;
        }
        else {
            return rules.errors;
        }
    },
    resetMarker : function () {
        this.output = '';
        this.resetStateVars(true);
        this.stateVars.openStack = [];
        return this.output;
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
    addToOutput : function (rule, next) {
        var toStack;
        switch (rule.type) {
            case ('containing'):
                if (next === true) {
                    this.output += rule.end;
                }
                else {
                    this.output += rule.start;
                    toStack = rule.chars;
                }
                break;
            case ('singleton'):
                this.output += rule.html;
                break;
            case ('multistep'):

                break;
            default:
                break;
        }
        return toStack;
    },
    applyRule : function (chars) {
        var rule = this.rules.fetchObjByKeyVal('chars', chars);
        if (rule !== undefined) {
            var stackType = typeof this.stateVars.openStack.last();
            var close = this.stateVars.openStack.last() === chars ? true : false;
            var open = this.addToOutput.call(this, rule, close);
            if (open) this.stateVars.openStack.push(open);
            if (close) this.stateVars.openStack.pop();
            this.resetStateVars(true);
        }
        else {
            console.log('problem applying rule');
        }
    },
    resetStateVars : function (subset) {
        this.stateVars.searchString = '';
        this.stateVars.charNum = 0;
        if (subset) this.stateVars.subset = this.matchChars;
    },
    masterLoop : function (textArray, dev) {
        if (this.matchChars === []) return "bindSequences: No rules to follow!";
        this.resetStateVars(true);
        textArray.forEach(function(token) {
            this.stateVars.subset = this.stateVars.subset.filterByCharAtVal(this.stateVars.charNum, token);
            this.stateVars.searchString += token;
            if (dev) {
                console.log('\n\t');
                console.log('NEXT CYCLE: searchString:' + this.stateVars.searchString + '; charNum: ' + this.stateVars.charNum + "; openStack last: " + this.stateVars.openStack.last() + '; subset length: ' + this.stateVars.subset.length);
            }
            if (this.stateVars.subset.length === 1 && this.stateVars.searchString === this.stateVars.subset[0]) {
                // narrowed down the possibilities: this is a matching rule!
                if (dev) console.log('exact match');
                this.applyRule(this.stateVars.searchString);
            }
            else if (this.stateVars.subset.length > 0) {
                // we can't narrow down our rule yet
                if (dev) console.log('multiple possibilities')
                this.stateVars.charNum ++;
            }
            else if (this.stateVars.subset.length === 0 && this.stateVars.searchString.length > 1) {
                // we elimintated too many options. our applicable rule is all but the most recent character
                // in the accumulate search string. Add this newest token to the output after we've followed the rule.
                if (dev) console.log('no options left; backtrace')
                var ruleChars = this.stateVars.searchString.replace(token, '');
                this.applyRule(ruleChars);
                if (token[0] === this.escapeChar) {
                    // remove escape char
                    this.output += token[1];
                }
                else {
                    this.output += token;
                }
            }
            else {
                // not a rule, just a normal character
                if (dev) console.log('nothing interesting, just add token');
                if (token[0] === this.escapeChar) {
                    // remove escape char
                    this.output += token[1];
                }
                else {
                    this.output += token;
                }
                this.resetStateVars(true);
            }

        }, this);
        if (this.stateVars.searchString !== '') {
            this.applyRule(this.stateVars.searchString);
        }
        return this.output;
    },
    process : function (text) {
        var tokenized = this.bindEscapes(this.read(this.clean(text)));
        this.masterLoop(tokenized);
        return this.output;
    }
};

module.exports = Marker;
