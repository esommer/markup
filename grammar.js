var Array = require('./arrFxns.js');

// TO DO:
// validation rules:
// - check that none of the names of rules contain a period or space
// - check for idiocy and problems (two inline elems with the same chars as ids)

var Grammar = function () {
    this.rules = [];
    this.specialChars = [];
};

Grammar.prototype = {
    initialize : function (ruleSet) {
        this.validate(ruleSet);
        this.idSpecialChars(ruleSet);
        return this;
    },
    validate : function (ruleSet) {
        var errors = [];
        var cleanRules = [];
        // check for idiocy
        ruleSet.forEach(function (rule) {
            var newRule = rule;
            if (!rule.domlevel) {
                newRule['domlevel'] = 'inline';
            }
            if (rule.type !== 'escape' && rule.type !== 'singleton' && rule.close === undefined) {
                newRule['close'] = [rule.chars];
            }
            if (rule.innerrules !== undefined) {
                var cleaned = this.validate(rule.innerrules);
                // DRAGONS HERE: (ignoring if errors returned?)
                newRule['innerrules'] = cleaned;
            }
            cleanRules.push(newRule);
        },this);
        this.rules = ruleSet;
        return errors.length > 0? errors: cleanRules;
    },
    addCharacters : function (startArray, arrayOfChars) {
        var outputArray = startArray;
        arrayOfChars.forEach(function (character) {
            if (!outputArray.inArray(character)) outputArray.push(character);
        });
        return outputArray;
    },
    idSpecialChars : function (rulesSet) {
        var specialChars = [];
        rulesSet.forEach(function (rule) {
            specialChars = this.addCharacters(specialChars, rule.chars.split(''));
            if (rule.close) {
                rule.close.forEach(function (closeChars) {
                    specialChars = this.addCharacters(specialChars, closeChars.split(''));
                }, this);
            }
            if (rule.innerrules) {
                var innerSpecialChars = this.idSpecialChars(rule.innerrules);
                specialChars = this.addCharacters(specialChars, innerSpecialChars);
            }
        },this);
        this.specialChars = specialChars;
        return specialChars;
    }
};

module.exports = Grammar;
