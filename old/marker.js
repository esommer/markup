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

var Tokenizer = function (rules) {
    this.rules = rules;
    this.openRule = [];
    this.matchChars = [];
    this.searchString = '';
    this.charNum = 0;
};

Tokenizer.prototype = {
    run : function (text) {

    }
};

var tokenizer = new Tokenizer(rules);
tokenizer.run(text);

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
            // if (dev) {
            //     console.log('\n\t');
            //     console.log('NEXT CYCLE: searchString:' + this.stateVars.searchString + '; charNum: ' + this.stateVars.charNum + "; openStack last: " + this.stateVars.openStack.last() + '; subset length: ' + this.stateVars.subset.length);
            // }
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
    readTokens : function (tokenArray, tokenNum, escape, openRule, subset, charNum, searchString, output, errors, backtrace, dev) {
        var token = tokenArray[tokenNum];
        if (dev) {
            console.log('\n\t');
            console.log('CYCLE ' + tokenNum + ': \n\ttoken: ' + token + '; \n\tsearchString:' + searchString + '; \n\tcharNum: ' + charNum + "; \n\topenRule: " + openRule.last() + '; \n\tsubset: ' + subset);
        }

        // if we're done (and haven't blown up so far), return true:
        if (tokenNum === tokenArray.length) return errors.length > 0? errors: true;

        var filtered = subset.filterByCharAtVal(charNum, token);
        searchString += token;
        if (backtrace === true) console.log('\n\tI FOUND A BACKTRACE!');
        switch (filtered.length) {
            case (1):
                // found an exact match!
                if (filtered[0] === searchString) {
                    console.log('\n\tEXACT MATCH');
                    searchString = '';
                    charNum = 0;
                    tokenNum++;
                }
                // tres bizarre...
                else {
                    tokenNum++;
                    console.log('\n\t...interesting case 1');
                }
                break;
            case (0):
                // we've surpassed our searchString: about face!
                if (charNum > 0) {
                    console.log('\n\tBACKTRACE!');
                    searchString.replace(token,'');
                    backtrace = true;
                    tokenNum--;
                }
                // we got nuthin'; keep chuggin' forward.
                else {
                    charNum++;
                    tokenNum++;
                }
                break;
            default: // several matching rules

                break;
        }

        return this.readTokens(tokenArray, tokenNum, escape, openRule, subset, charNum, searchString, output, errors, backtrace, dev);
    },
    process : function (text, dev) {
        var tokenized = this.bindEscapes(this.read(this.clean(text)));
        var result = this.readTokens(tokenized, 0, this.escapeChar, [], this.matchChars, 0, '', '', [], undefined, dev);
        if (result === true) return this.output;
        else return result? result: "ERROR :(";
    }
};

module.exports = Marker;
