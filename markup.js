var Array = require('./arrFxns');
var Grammar = require('./grammar.js');
var Tokenizer = require('./tokenizer.js');
var Parser = require('./parser.js');
var defaultRules = require('./rules.js');

var grammar = new Grammar();
var tokenizer = new Tokenizer();
var parser = new Parser(true);

run = function (rules, grammar, tokenizer, parser) {
    var ruleBook = grammar.initialize(rules);
    var text = '';
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    console.log('Enter text to parse:');
    process.stdin.on('data', function(response) {
        if (response.length > 0) {
            text = response;
            var tokenized = tokenizer.tokenize(ruleBook.specialChars, text);
            var output = parser.parse(ruleBook, tokenized);
            console.log("RESULT: "+output);
            process.stdin.pause();
        }
        else {
            console.log("You didn't enter any text! :(");
            process.stdin.pause();
        }
    });

};

run(defaultRules, grammar, tokenizer, parser);
