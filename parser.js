var Array = require('./arrFxns.js');

var debug = false;
dev = function (text) {
    if (debug) console.log(text);
}
var Parser = function (debugOn) {
    if (debugOn) debug = true;

    this.envs = [];

    //STACKS:
    this.ruleStack = [];
    this.stack = [];
    this.closingChars = [];
    this.currentRules = [];
    this.domlevelStack = [];

    // STATES:
    this.domlevel = '';
    this.contextIds = [];
    this.escapeChar = '';

    // COLLECTORS:
    this.junk = '';
    this.idBuffer = [];
    this.filteredIds = [];

    // FINAL OUTPUT CONTAINER:
    this.output = [];
};

Parser.prototype = {
    parse : function (grammar, tokens) {
        dev('\n');
        this.setup(grammar);
        var escapeFound = false;
        tokens.forEach(function (token){
            dev('beginning token: ' + token.type + " = " + JSON.stringify(token.content));
            if (token.type === 'special?') {
                if (escapeFound === true) {
                    this.junk += token.content;
                    escapeFound = false;
                }
                else if (token.content === this.escapeChar) escapeFound = true;
                else this.consume(token.content);
            }
            else {
                if (this.idBuffer.length > 0
                    && this.getIdName(this.filteredIds, this.idBuffer.join(''))) {
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
            && this.getIdName(this.filteredIds, this.idBuffer.join(''))) {
            this.updateContext(this.idBuffer.join(''));
        }
        if (this.junk.length > 0) {
            this.output.push(junk);
            this.junk = '';
        }
        dev('\n');
        return this.output;
    },
    setup : function (grammar) {
        this.currentRules = grammar.rules;
        this.ruleStack.push(this.currentRules);
        this.escapeChar = this.currentRules.fetchObjByKeyVal('name', 'escape').chars;
        this.domlevel = 'block';
        this.contextIds = this.generateIdList(this.currentRules, this.domlevel);
        this.filteredIds = this.contextIds;
        return this;
    },
    filterIdListByCharToken : function (idList, charNum, token) {
        var filtered = [];
        idList.forEach(function (id) {
            if (JSON.stringify(Object.keys(id)[0][charNum]) === JSON.stringify(token)) filtered.push(id);
        });
        return filtered;
    },
    getIdName : function (idList, chars) {
        for (var i = 0; i<idList.length; i++) {
            var key = Object.keys(idList[i])[0];
            if (JSON.stringify(key) === JSON.stringify(chars)) {
                dev('inside getIdName: '+idList[i][key]);
                return idList[i][key];
            }
        }
    },
    generateIdList : function (rules, domlevel) {
        var idList = [];
        rules.forEach(function(rule) {
            var append = '';
            var ruleIdObj = {};
            if (rule.type !== 'escape' && rule.type !== 'singleton') {
                append = '.open';
            }
            if (domlevel === 'block') {
                ruleIdObj[rule.chars] = rule.name + append;
            }
            else {
                if (rule.domlevel === 'inline') {
                    ruleIdObj[rule.chars] = rule.name + append;
                }
                else {
                    ruleIdObj[rule.chars] = 'blockWarning';
                }
            }
            idList.push(ruleIdObj);
        });
        return idList;
    },
    combineRules : function (origRules, newRules) {
        var outputRules = origRules;
        var charsArray = outputRules.map(function (rule) {
            return rule.chars;
        });
        newRules.forEach(function (rule) {
            var index = charsArray.indexOf(rule.chars);
            if (index !== -1) {
                outputRules[index] = rule;
            }
            else {
                outputRules.push(rule);
            }
        });
        return outputRules;
    },
    getIdIndex : function (idList, matchChars) {
        var name = this.getIdName(idList, matchChars);
        var obj = {};
        obj[matchChars] = name;
        var idIndex = '';
        idList.forEach(function (id, index) {
            if (JSON.stringify(id) === JSON.stringify(obj)) {
                idIndex = index;
            }
        });
        return idIndex;
    },
    updateAllowed : function (rule, closed) {
        this.closingChars.push(rule.close);
        if (rule.type === 'containing') {
            this.contextIds = this.generateIdList(this.currentRules, this.domlevel);
            if (!closed) {
                this.domlevel = rule.domlevel;
                this.domlevelStack.push(rule.domlevel);
                var index = this.getIdIndex(this.contextIds, rule.chars);
                rule.close.forEach(function (closer, closerIndex) {
                    var replaceObj = {};
                    replaceObj[closer] = rule.name + '.close';
                    if (JSON.stringify(closer) === JSON.stringify(rule.chars)) {
                        this.contextIds[index] = replaceObj;
                        console.log('ADDED / FIXED CLOSING TAG');
                        console.log(this.contextIds);
                    }
                    else {
                        this.contextIds.push(replaceObj);
                    }
                }, this);
            }
            else {
                this.domlevelStack.pop();
                this.domlevel = this.domlevelStack.last();
                rule.close.forEach(function (closer) {
                    var delIndex = this.getIdIndex(this.contextIds, rule.chars);
                    this.contextIds.splice(delIndex, 1);
                },this);
                var replaceObj = {};
                replaceObj[rule.chars] = rule.name + '.open';
                this.contextIds.push(replaceObj);

            }
        }
        else if (rule.type === 'complex') {
            if (!closed) {
                this.ruleStack.push(this.currentRules);
                var rules = [];
                if (rule.overrideouter !== true) {
                    rules = this.combineRules(this.currentRules, rule.innerrules);
                }
                else {
                    rules = rule.innerrules;
                }
                this.currentRules = this.generateIdList(rules, rule.domlevel);
            }
            else {
                this.currentRules = ruleStack.pop();
            }
            this.contextIds = this.generateIdList(this.currentRules, this.domlevel);
        }
    },
    pushToOutput : function (chunk) {
        if (this.junk.length > 0) {
            this.output.push(this.junk);
            this.junk = '';
        }
        this.output.push(chunk);
        this.idBuffer = [];
    },
    updateContext : function (matchedId) {
        var ruleName = this.getIdName(this.contextIds, matchedId);
        var searchName = ruleName.replace('.open', '').replace('.close', '');
        var rule = this.currentRules.fetchObjByKeyVal('name',searchName);
        if (this.closingChars.length > 0 && this.closingChars.last().inArray(matchedId)) {
            dev('CLOSING CONTEXT: '+ matchedId);
            this.stack.pop();
            this.closingChars.pop();
            this.updateAllowed(rule, true);
            this.pushToOutput(ruleName);
        }
        else if (rule.type === 'singleton') {
            this.pushToOutput(ruleName);
        }
        else {
            dev("OPENING CONTEXT: " + matchedId);
            if (ruleName === 'blockWarning') {
                this.pushToOutput('blockWarning: '+ matchedId);
            }
            else if (ruleName === 'tag open error') {
                this.pushToOutput('tag open error: ' + matchedId);
            }
            else {
                this.stack.push(ruleName);
                this.updateAllowed(rule);
                this.pushToOutput(ruleName);
            }
        }
        this.filteredIds = this.contextIds;
    },
    consume : function (token) {
        console.log('in consume, token: ' + token);
        console.log(this.filteredIds);
        var searchedIds = this.filterIdListByCharToken(this.filteredIds, this.idBuffer.length, token);
        switch (searchedIds.length) {
            case (0):
                dev('CONSUME: '+ JSON.stringify(token) + ' SEARCH FOUND 0');
                if (this.idBuffer.length === 0) {
                    this.junk += token;
                }
                else {
                    this.updateContext(this.idBuffer.join(''));
                    this.consume(token);
                }
                break;
            case (1):
                if (JSON.stringify(token) === JSON.stringify(searchedIds[0])) {
                    dev('CONSUME: '+ JSON.stringify(token) + ' SEARCH FOUND 1');
                    this.idBuffer.push(token);
                    this.updateContext(this.idBuffer.join(''));
                }
                else {
                    this.idBuffer.push(token);
                    this.filteredIds = searchedIds;
                }
                break;
            default:
                dev('CONSUME: '+ JSON.stringify(token) + ' SEARCH FOUND 1+');
                this.idBuffer.push(token);
                this.filteredIds = searchedIds;
                break;
        }
    }
};

module.exports = Parser;
