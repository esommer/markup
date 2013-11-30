var Parser = function () {
    this.router = {
        'escape' : this.setEscape,
        'containing': this.setContainer
    }
    this.escapeChar = '';
    this.containers = [];
    this.errors = '';
    return this;
}

Parser.prototype = {
    readRules : function (rulesArray) {
        rulesArray.forEach(function (rule) {
            var route = this.router[rule.type];
            if (route !== undefined) {
                this.router[rule.type].call(this, rule);
            }
            else {
                this.errors += "invalid rule type; rule: " + rule.chars + ", type: " + rule.type + "; ";
            }
        }, this);
        return this;
    },
    sortContainers : function (containers) {
        var toSort = containers;
        toSort.sort(function (first, second) {
            if (first.length < second.length) return 1;
            if (first.length > second.length) return -1;
            return 0;
        });
        return toSort;
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
    setContainer : function (rule) {
        this.containers.push(rule.chars);
    },
    getEscape : function () {
        return this.escapeChar;
    },
    getContainers : function () {
        return this.containers;
    }
}

module.exports = Parser;
