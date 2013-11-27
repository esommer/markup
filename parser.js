var Parser = function (rulesArray) {
    this.router = {
        'escape' : this.setEscape,
        'containing': this.setContainer
    }
    this.escapeChar = '';
    this.errors = '';
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
}

Parser.prototype = {
    setEscape : function (rule) {
        if (rule.chars.length === 1) {
            this.escapeChar = rule.chars;
        }
        else {
            this.errors += "parseRulesError: Escape character must be ONE character; ";
        }
    },
    setContainer : function (rule) {

    }
}

module.exports = Parser;
