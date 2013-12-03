var Parser = function () {
    this.legalRuleTypes = ['containing','singleton','multistep'];
    this.escapeChar = '';
    this.matchChars = [];
    this.rules = [];
    this.errors = '';
    return this;
}

Parser.prototype = {
    readRules : function (rulesArray) {
        rulesArray.forEach(function (rule) {
            if (rule.type === 'escape') {
                this.setEscape(rule);
            }
            else if (this.legalRuleTypes.indexOf(rule.type) !== undefined) {
                this.rules.push(rule);
                this.matchChars.push(rule.chars);
            }
            else {
                this.errors += "invalid rule type; rule: " + rule.chars + ", type: " + rule.type + "; ";
            }
        }, this);
        return this;
    },
    getErrors : function () {
        return this.errors;
    },
    setEscape : function (rule) {
        if (rule.chars.length === 1) {
            this.escapeChar = rule.chars;
        }
        else {
            this.errors += "parseRulesError: Escape character must be ONE character; ";
        }
    },
    getEscape : function () {
        return this.escapeChar;
    },
    getMatchChars : function () {
        return this.matchChars;
    }
}

module.exports = Parser;
