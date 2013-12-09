var Array = require('./arrFxns');
var Tester = require('./tester.js');
var Grammar = require('./grammar.js');
var Tokenizer = require('./tokenizer.js');
var Parser = require('./parser.js');
var defaultRules = require('./rules.js');

var tester = new Tester();

// TEST GRAMMAR:
tester.envs.push(function () {
    var grammar = new Grammar();
    var rules = [{chars: '~',name: 'escape',type: 'escape'},{chars: '##',name: 'bold',type: 'containing'},{chars: '//',name: 'italics',type: 'containing'},{chars: '```',name: 'code',type: 'complex',overrideouter: false,innerrules: [{chars: '//',name: 'comment',type: 'containing',close: ['\n']}]}];

    // VALIDATE:
    tester.set('validate returns ruleSet', 'validate not working', rules, grammar.validate, [rules], grammar, true);
    // IDSPECIALCHARS:
    tester.set('idSpecialChars returns correctly', 'idSpecialChars not working', ['~','#','/','`','\n'], grammar.idSpecialChars, [rules], grammar,true);
});


// TESTING TOKENIZER:
tester.envs.push(function () {
    var tokenizer = new Tokenizer();
    var specialChars = ['#','/','\n','\t'];
    var text = "this is \nsome text... ##with// special chars.";

    tester.set('tokenize working','tokenize not working',[{'type':'junk','content':'this is '},{'type':'special?','content':'\n'},{'type':'junk','content':'some text... '},{'type':'special?','content':'#'},{'type':'special?','content':'#'},{'type':'junk','content':'with'},{'type':'special?','content':'/'},{'type':'special?','content':'/'},{'type':'junk','content':' special chars.'}], tokenizer.tokenize, [specialChars, text], undefined,true);
});

// TEST PARSER ELEMENTS
tester.envs.push(function () {
    var parser = new Parser();
    var mockGrammar = {rules: [{"chars":"~","name":"escape","type":"escape","domlevel":"inline"},{"chars":"##","name":"h2","type":"containing","domlevel":"blockonly","close":["##"]},{"chars":"//","name":"italics","type":"containing","domlevel":"inline","close":["//"]},{"chars":"```","name":"code","type":"complex","overrideouter":false,"innerrules":[{"chars":"//","name":"comment","type":"containing","domlevel":"inline","close":["\n"]}],"domlevel":"block","close":["```"]}]};
    var mockIdList = [{"~":"escape"},{"##":"h2.open"},{"//":"italics.open"},{"```":"code.open"}];
    var subRules = [{"chars":"//","name":"comment","type":"containing","domlevel":"inline","close":["\n"]}];

    // GENERATE IDLIST for block-level elem
    tester.set('generateIdList returns list of ids for block-level elems', 'generateIdList not working for block-level elems', [{'~':'escape'},{'##':'h2.open'},{'//':'italics.open'},{'```':'code.open'}], parser.generateIdList, [mockGrammar.rules, 'block'], parser, true);
    // GENERATE IDLIST for inline elem
    tester.set('generateIdList returns list of ids for inline elems', 'generateIdList not working for inline elems', [{'~':'escape'},{'##':'blockWarning'},{'//':'italics.open'},{'```':'blockWarning'}], parser.generateIdList, [mockGrammar.rules, 'inline'], parser, true);
    // SETUP:
    tester.set('setup returns correct parser object', 'setup not working', {
            ruleStack : [[{"chars":"~","name":"escape","type":"escape","domlevel":"inline"},{"chars":"##","name":"h2","type":"containing","domlevel":"blockonly","close":["##"]},{"chars":"//","name":"italics","type":"containing","domlevel":"inline","close":["//"]},{"chars":"```","name":"code","type":"complex","overrideouter":false,"innerrules":[{"chars":"//","name":"comment","type":"containing","domlevel":"inline","close":["\n"]}],"domlevel":"block","close":["```"]}]],
            stack : [],
            closingChars : [],
            currentRules : [{"chars":"~","name":"escape","type":"escape","domlevel":"inline"},{"chars":"##","name":"h2","type":"containing","domlevel":"blockonly","close":["##"]},{"chars":"//","name":"italics","type":"containing","domlevel":"inline","close":["//"]},{"chars":"```","name":"code","type":"complex","overrideouter":false,"innerrules":[{"chars":"//","name":"comment","type":"containing","domlevel":"inline","close":["\n"]}],"domlevel":"block","close":["```"]}],
            domlevelStack : [],
            domlevel : 'block',
            contextIds : [{"~":"escape"},{"##":"h2.open"},{"//":"italics.open"},{"```":"code.open"}],
            escapeChar : '~',
            junk : '',
            idBuffer : [],
            filteredIds : [{"~":"escape"},{"##":"h2.open"},{"//":"italics.open"},{"```":"code.open"}],
            output : []
        }, parser.setup, [mockGrammar], parser, true);
    // GETIDNAME
    tester.set('getIdName returning name', 'getIdName not working', 'h2.open', parser.getIdName, [mockIdList, '##'], parser, true);
    // FILTERIDLISTBYCHARTOKEN:
    tester.set('filterIdListByCharToken returning filtered list', 'filterIdListByCharToken not working', [{'//':'italics.open'}], parser.filterIdListByCharToken, [mockIdList, 1, '/'], parser, true);
    // COMBINE RULES!
    tester.set('combineRules working correctly', 'combineRules not working', [{"chars":"~","name":"escape","type":"escape","domlevel":"inline"},{"chars":"##","name":"h2","type":"containing","domlevel":"blockonly","close":["##"]},{"chars":"//","name":"comment","type":"containing","domlevel":"inline","close":["\n"]},{"chars":"```","name":"code","type":"complex","overrideouter":false,"innerrules":[{"chars":"//","name":"comment","type":"containing","domlevel":"inline","close":["\n"]}],"domlevel":"block","close":["```"]}], parser.combineRules, [mockGrammar.rules, subRules], parser, true);
    // GETIDINDEX:
    tester.set('getIdIndex returning correct index num', 'getIdIndex not working', 1, parser.getIdIndex, [mockIdList, '##', 'h2.open'], parser,true);
});







// TESTING PARSER:
tester.envs.push(function () {
    var parser = new Parser(true);
    var rules = defaultRules;
    var grammar = new Grammar();
    grammar.initialize(rules);
    var tokenizer = new Tokenizer();

    var text = "##here is some //simple// text##";
    var tokenized = tokenizer.tokenize(grammar.specialChars, text);

    // SIMPLE TEXT TEST
    tester.set('parser working', 'parser not working', ['h2.open','here is some ','italics.open','simple','italics.close',' text','h2.close'], parser.parse, [grammar,tokenized], parser);

});

// tester.envs.push(function () {
//     var parser = new Parser(true);
//     var rules = defaultRules;
//     var grammar = new Grammar();
//     grammar.initialize(rules);
//     var tokenizer = new Tokenizer();

//     var complexText = "##Here is an h2\nAnd next up is some code:\n```var blah = 'blah'; // I dislike meaningless examples.\nconsole.log(blah);```\nNow this should give us //italics//! And this should just print an ~#octothorpe instead of an h1.\nEOM";
//     var complexTokens = tokenizer.tokenize(grammar.specialChars, complexText);

//     console.log(complexTokens);
//     // NESTED TEXT TEST
//     tester.set('parser working fabulously', 'parser not working so well', ['h2.open','Here is an h2','h2.close','And next up is some code:\n','code.open','var blah = \'blah\'; ','comment.open', ' I dislike meaningless examples.','comment.close','console.log(blah);','code.close','Now this should give us ','italics.open','italics','italics.close','! And this should just print an #octothorpe instead of an h1.\nEOM'], parser.parse, [grammar,complexTokens], parser);
// });


tester.build();
console.log(tester.display());
