var Array = require('./arrFxns.js');

var Tokenizer = function () {
};

Tokenizer.prototype = {
    tokenize : function (specialChars, text) {
        var tokens = [];
        var junk = '';
        text.split('').forEach(function(character) {
            if (specialChars.inArray(character)) {
                if (junk !== '') {
                    tokens.push({type: 'junk', content: junk});
                    junk = '';
                }
                tokens.push({type: 'special?', content: character});
            }
            else {
                junk += character;
            }
        });
        if (junk !== '') {
            tokens.push({type: 'junk', content: junk});
        }
        return tokens;
    }
};

module.exports = Tokenizer;
