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
        // var validated = this.validate(ruleSet);
        var expanded = this.expandRules(ruleSet);
        this.idSpecialChars(expanded);
        return this;
    },
    copyObj : function (obj) {
        // special thanks to http://stackoverflow.com/a/728694, user A. Levy
        if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || obj === null) return obj;
        if (obj instanceof Array) {
            var newObj = [];
            for (var i=0; i<obj.length; i++) newObj[i] = this.copyObj(obj[i]);
        }
        else {
            var newObj = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) newObj[attr] = this.copyObj(obj[attr]);
            }
        }
        return newObj;
    },
    expandRules : function (ruleSet, parent) {
        var newSet = [];
        ruleSet.forEach(function (rule) {
            var newRule = this.copyObj(rule);
            newRule['state'] = 'on';
            if (!newRule.domlevel) newRule['domlevel'] = 'inline';
            if (parent) {
                newRule['parent'] = parent;
                newRule['state'] = 'off';
            }
            if (newRule.type !== 'escape' && newRule.type !== 'singleton' && newRule.close === undefined) newRule['close'] = [newRule.chars];
            if (newRule.close) {
                newRule['whichend'] = 'open';
                newRule.close.forEach(function (closer) {
                    var closeRule = this.copyObj(newRule);
                    closeRule['chars'] = this.copyObj(closer);
                    closeRule['whichend'] = 'close';
                    closeRule['state'] = 'off';
                    newSet.push(closeRule);
                }, this);
            }
            if (newRule.innerrules) {
                var innerArray = this.expandRules(newRule.innerrules, newRule.name);
                innerArray.forEach(function (elem) {
                    newSet.push(elem);
                }, this);
            }
            newSet.push(newRule);
        }, this);
        this.rules = newSet;
        return newSet;
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
        },this);
        this.specialChars = specialChars;
        return specialChars;
    }
};

module.exports = Grammar;
