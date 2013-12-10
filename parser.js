var Array = require('./arrFxns.js');

var debug = false;
dev = function (text) {
    if (debug) console.log(text);
}
var Parser = function () {
    // ENVIRONMENT STACK:
    this.envs = [];

    // COLLECTORS:
    this.junk = '';
    this.idBuffer = [];
    this.filteredRules = [];

    // FINAL OUTPUT CONTAINER:
    this.output = [];
};

Parser.prototype = {
    debug: function (on) {
        if (on) debug = true;
    },
    parse : function (grammar, tokens) {
        dev('\n');
        this.setup(grammar.rules);
        var escapeFound = false;
        tokens.forEach(function (token){
            dev('beginning token: ' + token.type + " = " + JSON.stringify(token.content));
            if (token.type === 'special?') {
                if (escapeFound === true) {
                    this.junk += token.content;
                    escapeFound = false;
                }
                else if (token.content === this.escapeChar) escapeFound = true;
                else this.consume(token.content, this.filteredRules);
            }
            else {
                if (this.idBuffer.length > 0
                    && this.getRulePart(this.filteredRules, 'chars', this.idBuffer.join(''), 'on', 'chars')) {
                    this.updateContext(this.idBuffer.join(''));
                }
                this.junk += token.content;
            }
            dev("idBuffer: "+this.idBuffer.join(''));
            dev("junk: "+ this.junk + '|');
            dev("OUTPUT: "+ this.output + '|');
            dev('\n');
        },this);
        if (this.idBuffer.length > 0
            && this.getRulePart(this.filteredRules, 'chars', this.idBuffer.join(''), 'on', 'chars')) {
            this.updateContext(this.idBuffer.join(''));
        }
        if (this.junk.length > 0) {
            this.output.push(junk);
            this.junk = '';
        }
        dev('\n');
        return this.output;
    },
    getRulePart : function (rules, key, val, state, part) {
        var result = rules.filter(function(rule) {
            var stateTest = state !== undefined? rule.state === state: true;
            if (this.equal(rule[key],val) && stateTest) return rule;
        }, this);
        if (result.length === 1) {
            result = result[0];
            if (part) result = result[part];
        }
        else result = false;
        return result;
    },
    setup : function (rules) {
        var env = {
            rules : rules,
            openElems : [],
            domLevel : 'block',
            escape : this.getRulePart(rules, 'name', 'escape', 'on', 'chars')
        };
        this.envs.push(env);
        this.filteredRules = this.envs.last().rules;
        return this;
    },
    // filterIdListByCharToken : function (idList, charNum, token) {
    //     var filtered = [];
    //     idList.forEach(function (id) {
    //         if (JSON.stringify(Object.keys(id)[0][charNum]) === JSON.stringify(token)) filtered.push(id);
    //     });
    //     return filtered;
    // },
    // getIdName : function (idList, chars) {
    //     for (var i = 0; i<idList.length; i++) {
    //         var key = Object.keys(idList[i])[0];
    //         if (JSON.stringify(key) === JSON.stringify(chars)) {
    //             dev('inside getIdName: '+idList[i][key]);
    //             return idList[i][key];
    //         }
    //     }
    // },
    // generateIdList : function (rules, domlevel) {
    //     var idList = [];
    //     rules.forEach(function(rule) {
    //         var append = '';
    //         var ruleIdObj = {};
    //         if (rule.type !== 'escape' && rule.type !== 'singleton') {
    //             append = '.open';
    //         }
    //         if (domlevel === 'block') {
    //             ruleIdObj[rule.chars] = rule.name + append;
    //         }
    //         else {
    //             if (rule.domlevel === 'inline') {
    //                 ruleIdObj[rule.chars] = rule.name + append;
    //             }
    //             else {
    //                 ruleIdObj[rule.chars] = 'blockWarning';
    //             }
    //         }
    //         idList.push(ruleIdObj);
    //     });
    //     return idList;
    // },
    // combineRules : function (origRules, newRules) {
    //     var outputRules = origRules;
    //     var charsArray = outputRules.map(function (rule) {
    //         return rule.chars;
    //     });
    //     newRules.forEach(function (rule) {
    //         var index = charsArray.indexOf(rule.chars);
    //         if (index !== -1) {
    //             outputRules[index] = rule;
    //         }
    //         else {
    //             outputRules.push(rule);
    //         }
    //     });
    //     return outputRules;
    // },
    // getIdIndex : function (idList, matchChars) {
    //     var name = this.getIdName(idList, matchChars);
    //     var obj = {};
    //     obj[matchChars] = name;
    //     var idIndex = '';
    //     idList.forEach(function (id, index) {
    //         if (JSON.stringify(id) === JSON.stringify(obj)) {
    //             idIndex = index;
    //         }
    //     });
    //     return idIndex;
    // },
    // updateAllowed : function (rule, closed) {
    //     this.closingChars.push(rule.close);
    //     if (rule.type === 'containing') {
    //         this.contextIds = this.generateIdList(this.currentRules, this.domlevel);
    //         if (!closed) {
    //             this.domlevel = rule.domlevel;
    //             this.domlevelStack.push(rule.domlevel);
    //             var index = this.getIdIndex(this.contextIds, rule.chars);
    //             rule.close.forEach(function (closer, closerIndex) {
    //                 var replaceObj = {};
    //                 replaceObj[closer] = rule.name + '.close';
    //                 if (JSON.stringify(closer) === JSON.stringify(rule.chars)) {
    //                     this.contextIds[index] = replaceObj;
    //                     console.log('ADDED / FIXED CLOSING TAG');
    //                     console.log(this.contextIds);
    //                 }
    //                 else {
    //                     this.contextIds.push(replaceObj);
    //                 }
    //             }, this);
    //         }
    //         else {
    //             this.domlevelStack.pop();
    //             this.domlevel = this.domlevelStack.last();
    //             rule.close.forEach(function (closer) {
    //                 var delIndex = this.getIdIndex(this.contextIds, rule.chars);
    //                 this.contextIds.splice(delIndex, 1);
    //             },this);
    //             var replaceObj = {};
    //             replaceObj[rule.chars] = rule.name + '.open';
    //             this.contextIds.push(replaceObj);

    //         }
    //     }
    //     else if (rule.type === 'complex') {
    //         if (!closed) {
    //             this.ruleStack.push(this.currentRules);
    //             var rules = [];
    //             if (rule.overrideouter !== true) {
    //                 rules = this.combineRules(this.currentRules, rule.innerrules);
    //             }
    //             else {
    //                 rules = rule.innerrules;
    //             }
    //             this.currentRules = this.generateIdList(rules, rule.domlevel);
    //         }
    //         else {
    //             this.currentRules = ruleStack.pop();
    //         }
    //         this.contextIds = this.generateIdList(this.currentRules, this.domlevel);
    //     }
    // },
    pushToOutput : function (chunk) {
        if (this.junk.length > 0) {
            var junkObj = {
                type: 'junk',
                content: this.junk
            };
            this.output.push(junkObj);
            this.junk = '';
        }
        this.output.push(chunk);
        this.idBuffer = [];
    },
    // updateContext : function (matchedId) {
    //     var ruleName = this.getIdName(this.contextIds, matchedId);
    //     var searchName = ruleName.replace('.open', '').replace('.close', '');
    //     var rule = this.currentRules.fetchObjByKeyVal('name',searchName);
    //     if (this.closingChars.length > 0 && this.closingChars.last().inArray(matchedId)) {
    //         dev('CLOSING CONTEXT: '+ matchedId);
    //         this.stack.pop();
    //         this.closingChars.pop();
    //         this.updateAllowed(rule, true);
    //         this.pushToOutput(ruleName);
    //     }
    //     else if (rule.type === 'singleton') {
    //         this.pushToOutput(ruleName);
    //     }
    //     else {
    //         dev("OPENING CONTEXT: " + matchedId);
    //         if (ruleName === 'blockWarning') {
    //             this.pushToOutput('blockWarning: '+ matchedId);
    //         }
    //         else if (ruleName === 'tag open error') {
    //             this.pushToOutput('tag open error: ' + matchedId);
    //         }
    //         else {
    //             this.stack.push(ruleName);
    //             this.updateAllowed(rule);
    //             this.pushToOutput(ruleName);
    //         }
    //     }
    //     this.filteredIds = this.contextIds;
    // },
    equal : function (a, b) {
        if (JSON.stringify(a) === JSON.stringify(b)) return true;
        else return false;
    },
    updateContext : function (matchstring) {
        console.log('FOUND:');
        console.log(arguments);
        console.log(this.envs.last().rules);
        var rule = this.getRulePart(this.filteredRules, 'chars', matchstring, 'on');
        var chunk = {
            type: 'tag',
            elem: rule.name,
            whichend: rule.whichend
        };
        this.pushToOutput(chunk);
        this.filteredRules = this.envs.last().rules;
    },
    filterRulesByTokenChar : function (rules, charIndex, token, state) {
        var result = rules.filter(function (rule) {
            if (this.equal(rule.chars[charIndex],token) && rule.state === state) {
                return rule;
            }
        },this);
        return result;
    },
    consume : function (token, filteredRules) {
        dev('\nin consume, token: ' + token);
        var searchedRules = this.filterRulesByTokenChar(filteredRules, this.idBuffer.length, token, 'on');
        var results = searchedRules.length;
        switch (searchedRules.length) {
            case (0):
                // No matches, nothing even close: token is junk
                if (this.idBuffer.length === 0) {
                    this.junk += token;
                }
                // We've found the limit of a matching token -- send the match
                // to updateContext, re-consume this token with FRESH filteredRules
                else {
                    this.updateContext(this.idBuffer.join(''));
                    // we need to reset filteredRules first ^^^
                    this.consume(token, filteredRules);
                }
                break;
            case (1):
                // Exact match! This is great! Update that shit.
                if (this.equal(token, searchedRules[0])) {
                    this.idBuffer.push(token);
                    this.updateContext(this.idBuffer.join(''));
                }
                // We might be building towards a match, add to our
                else {
                    this.idBuffer.push(token);
                    this.filteredRules = searchedRules;
                }
                break;
            default:
                this.idBuffer.push(token);
                this.filteredRules = searchedRules;
                break;
        }
        dev('CONSUME: '+ JSON.stringify(token) + ' SEARCH FOUND ' + results);
        dev("FILTERED RULES:");
        dev(this.filteredRules);
        return results;
    }
};

module.exports = Parser;
