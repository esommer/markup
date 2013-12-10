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
    var rulesExpanded = [{"chars":"~","name":"escape","type":"escape","state":"on","domlevel":"inline"},{"chars":"##","name":"bold","type":"containing","state":"off","domlevel":"inline","close":["##"],"whichend":"close"},{"chars":"##","name":"bold","type":"containing","state":"on","domlevel":"inline","close":["##"],"whichend":"open"},{"chars":"//","name":"italics","type":"containing","state":"off","domlevel":"inline","close":["//"],"whichend":"close"},{"chars":"//","name":"italics","type":"containing","state":"on","domlevel":"inline","close":["//"],"whichend":"open"},{"chars":"```","name":"code","type":"complex","overrideouter":false,"innerrules":[{"chars":"//","name":"comment","type":"containing","close":["\n"]}],"state":"off","domlevel":"inline","close":["```"],"whichend":"close"},{"chars":"\n","name":"comment","type":"containing","close":["\n"],"state":"off","domlevel":"inline","parent":"code","whichend":"close"},{"chars":"//","name":"comment","type":"containing","close":["\n"],"state":"off","domlevel":"inline","parent":"code","whichend":"open"},{"chars":"```","name":"code","type":"complex","overrideouter":false,"innerrules":[{"chars":"//","name":"comment","type":"containing","close":["\n"]}],"state":"on","domlevel":"inline","close":["```"],"whichend":"open"}];

    // IDSPECIALCHARS:
    tester.set('idSpecialChars returns correctly', 'idSpecialChars not working', ['~','#','/','`','\n'], grammar.idSpecialChars, [rulesExpanded], grammar,true);
    // COPY OBJ
    tester.set('copy obj working', 'copy obj not working', {"chars":"###","innerrules":{"chars":'//',"type":'containing'},"type":"header"}, grammar.copyObj, [{chars: '###', innerrules: {chars: '//', type: 'containing'}, type: 'header'}], grammar, true);
    // EXPAND RULES:
    tester.set('expand rules returning correct stuff', 'expandrules not working', rulesExpanded, grammar.expandRules, [rules], grammar, true);
    // INITIALIZE:
    tester.set('grammar.initialize working', 'grammar.initialize not working', {rules: rulesExpanded, specialChars: ['~','#','/','`','\n']}, grammar.initialize, [rules], grammar, true);
});


// TESTING TOKENIZER:
tester.envs.push(function () {
    var tokenizer = new Tokenizer();
    var specialChars = ['#','/','\n','\t'];
    var text = "this is \nsome text... ##with// special chars.";

    tester.set('tokenize working','tokenize not working',[{'type':'junk','content':'this is '},{'type':'special?','content':'\n'},{'type':'junk','content':'some text... '},{'type':'special?','content':'#'},{'type':'special?','content':'#'},{'type':'junk','content':'with'},{'type':'special?','content':'/'},{'type':'special?','content':'/'},{'type':'junk','content':' special chars.'}], tokenizer.tokenize, [specialChars, text], undefined,true);
});

// TESTING PARSER ELEMENTS:
tester.envs.push(function () {
    var parser = new Parser();
    var rules = [{"chars":"~","name":"escape","type":"escape","state":"on","domlevel":"inline"},{"chars":"##","name":"bold","type":"containing","state":"off","domlevel":"inline","close":["##"],"whichend":"close"},{"chars":"##","name":"bold","type":"containing","state":"on","domlevel":"inline","close":["##"],"whichend":"open"},{"chars":"//","name":"italics","type":"containing","state":"off","domlevel":"inline","close":["//"],"whichend":"close"},{"chars":"//","name":"italics","type":"containing","state":"on","domlevel":"inline","close":["//"],"whichend":"open"},{"chars":"```","name":"code","type":"complex","overrideouter":false,"innerrules":[{"chars":"//","name":"comment","type":"containing","close":["\n"]}],"state":"off","domlevel":"inline","close":["```"],"whichend":"close"},{"chars":"\n","name":"comment","type":"containing","close":["\n"],"state":"off","domlevel":"inline","parent":"code","whichend":"close"},{"chars":"//","name":"comment","type":"containing","close":["\n"],"state":"off","domlevel":"inline","parent":"code","whichend":"open"},{"chars":"```","name":"code","type":"complex","overrideouter":false,"innerrules":[{"chars":"//","name":"comment","type":"containing","close":["\n"]}],"state":"on","domlevel":"inline","close":["```"],"whichend":"open"}];
    parser.debug();

    // EQUAL?
    tester.set('equal working', 'equal not working', true, parser.equal, ['a',{test: 'a'}.test], parser, true);
    // GET RULE PART:
    tester.set('getRulePart working', 'getRulePart not working', '~', parser.getRulePart, [rules, 'name', 'escape', 'on', 'chars'], parser, true);
    // SETUP:
    tester.set('setup working', 'setup not working', {"envs": [ {"rules": rules, "openElems" : [], "domLevel" : 'block', "escape" : "~"}], "junk" : '', "idBuffer" : [], "filteredRules": rules, "output" : []}, parser.setup, [rules], parser, true);
    // FILTER RULES BY TOKEN CHAR:
    tester.set('filter rules by token char working', 'filter rules by token char not working', [{"chars":"//","name":"italics","type":"containing","state":"on","domlevel":"inline","close":["//"],"whichend":"open"}], parser.filterRulesByTokenChar, [rules, 1, '/', 'on'], parser, true);
    // TEST CONSUME:
    tester.set('consume returns expected number of results', 'consume not working', 1, parser.consume, ['/',rules], parser, true);
});

// TEST PARSER CONSUME
tester.envs.push(function () {
    var parser = new Parser();
    parser.debug(true);
    var grammar = {rules : [{"chars":"~","name":"escape","type":"escape","state":"on","domlevel":"inline"},{"chars":"##","name":"bold","type":"containing","state":"off","domlevel":"inline","close":["##"],"whichend":"close"},{"chars":"##","name":"bold","type":"containing","state":"on","domlevel":"inline","close":["##"],"whichend":"open"},{"chars":"//","name":"italics","type":"containing","state":"off","domlevel":"inline","close":["//"],"whichend":"close"},{"chars":"//","name":"italics","type":"containing","state":"on","domlevel":"inline","close":["//"],"whichend":"open"},{"chars":"```","name":"code","type":"complex","overrideouter":false,"innerrules":[{"chars":"//","name":"comment","type":"containing","close":["\n"]}],"state":"off","domlevel":"inline","close":["```"],"whichend":"close"},{"chars":"\n","name":"comment","type":"containing","close":["\n"],"state":"off","domlevel":"inline","parent":"code","whichend":"close"},{"chars":"//","name":"comment","type":"containing","close":["\n"],"state":"off","domlevel":"inline","parent":"code","whichend":"open"},{"chars":"```","name":"code","type":"complex","overrideouter":false,"innerrules":[{"chars":"//","name":"comment","type":"containing","close":["\n"]}],"state":"on","domlevel":"inline","close":["```"],"whichend":"open"}]};
    // text: ##testing this //header// thing.##
    var tokenized = [{type: 'special?',content: "#"},{type: 'special?',content: "#"},{type: "junk", content: "testing this "},{type: 'special?', content: "/"},{type: 'special?', content: "/"},{type:'junk',content:'header'},{type: 'special?', content: "/"},{type: 'special?', content: "/"},{type:'junk',content:' thing.'},{type: 'special?',content: "#"},{type: 'special?',content: "#"}];

    tester.set('parser.parse working','parser.parse not working',[{"type":"tag","elem":"bold","whichend":"open"},{"type":"junk","content":"testing this "},{"type":"tag","elem":"italics","whichend":"open"},{"type":"junk","content":"header"},{"type":"tag","elem":"italics","whichend":"open"},{"type":"junk","content":" thing."},{"type":"tag","elem":"bold","whichend":"open"}],parser.parse, [grammar, tokenized], parser);

    // var mockGrammar = {rules: [{"chars":"~","name":"escape","type":"escape","state":"on","domlevel":"inline"},{"chars":"##","name":"bold","type":"containing","state":"off","domlevel":"inline","close":["##"],"whichend":"close"},{"chars":"##","name":"bold","type":"containing","state":"on","domlevel":"inline","close":["##"],"whichend":"open"},{"chars":"//","name":"italics","type":"containing","state":"off","domlevel":"inline","close":["//"],"whichend":"close"},{"chars":"//","name":"italics","type":"containing","state":"on","domlevel":"inline","close":["//"],"whichend":"open"},{"chars":"```","name":"code","type":"complex","overrideouter":false,"innerrules":[{"chars":"//","name":"comment","type":"containing","close":["\n"]}],"state":"off","domlevel":"inline","close":["```"],"whichend":"close"},{"chars":"\n","name":"comment","type":"containing","close":["\n"],"state":"off","domlevel":"inline","parent":"code","whichend":"close"},{"chars":"//","name":"comment","type":"containing","close":["\n"],"state":"off","domlevel":"inline","parent":"code","whichend":"open"},{"chars":"```","name":"code","type":"complex","overrideouter":false,"innerrules":[{"chars":"//","name":"comment","type":"containing","close":["\n"]}],"state":"on","domlevel":"inline","close":["```"],"whichend":"open"}]};
    // var mockIdList = [{"~":"escape"},{"##":"h2.open"},{"//":"italics.open"},{"```":"code.open"}];
    // var subRules = [{"chars":"//","name":"comment","type":"containing","domlevel":"inline","close":["\n"]}];

    // // GENERATE IDLIST for block-level elem
    // tester.set('generateIdList returns list of ids for block-level elems', 'generateIdList not working for block-level elems', [{'~':'escape'},{'##':'h2.open'},{'//':'italics.open'},{'```':'code.open'}], parser.generateIdList, [mockGrammar.rules, 'block'], parser, true);
    // // GENERATE IDLIST for inline elem
    // tester.set('generateIdList returns list of ids for inline elems', 'generateIdList not working for inline elems', [{'~':'escape'},{'##':'blockWarning'},{'//':'italics.open'},{'```':'blockWarning'}], parser.generateIdList, [mockGrammar.rules, 'inline'], parser, true);
    // // SETUP:
    // tester.set('setup returns correct parser object', 'setup not working', {
    //         ruleStack : [[{"chars":"~","name":"escape","type":"escape","state":"on","domlevel":"inline"},{"chars":"##","name":"bold","type":"containing","state":"off","domlevel":"inline","close":["##"],"whichend":"close"},{"chars":"##","name":"bold","type":"containing","state":"on","domlevel":"inline","close":["##"],"whichend":"open"},{"chars":"//","name":"italics","type":"containing","state":"off","domlevel":"inline","close":["//"],"whichend":"close"},{"chars":"//","name":"italics","type":"containing","state":"on","domlevel":"inline","close":["//"],"whichend":"open"},{"chars":"```","name":"code","type":"complex","overrideouter":false,"innerrules":[{"chars":"//","name":"comment","type":"containing","close":["\n"]}],"state":"off","domlevel":"inline","close":["```"],"whichend":"close"},{"chars":"\n","name":"comment","type":"containing","close":["\n"],"state":"off","domlevel":"inline","parent":"code","whichend":"close"},{"chars":"//","name":"comment","type":"containing","close":["\n"],"state":"off","domlevel":"inline","parent":"code","whichend":"open"},{"chars":"```","name":"code","type":"complex","overrideouter":false,"innerrules":[{"chars":"//","name":"comment","type":"containing","close":["\n"]}],"state":"on","domlevel":"inline","close":["```"],"whichend":"open"}]],
    //         stack : [],
    //         closingChars : [],
    //         currentRules : [{"chars":"~","name":"escape","type":"escape","state":"on","domlevel":"inline"},{"chars":"##","name":"bold","type":"containing","state":"off","domlevel":"inline","close":["##"],"whichend":"close"},{"chars":"##","name":"bold","type":"containing","state":"on","domlevel":"inline","close":["##"],"whichend":"open"},{"chars":"//","name":"italics","type":"containing","state":"off","domlevel":"inline","close":["//"],"whichend":"close"},{"chars":"//","name":"italics","type":"containing","state":"on","domlevel":"inline","close":["//"],"whichend":"open"},{"chars":"```","name":"code","type":"complex","overrideouter":false,"innerrules":[{"chars":"//","name":"comment","type":"containing","close":["\n"]}],"state":"off","domlevel":"inline","close":["```"],"whichend":"close"},{"chars":"\n","name":"comment","type":"containing","close":["\n"],"state":"off","domlevel":"inline","parent":"code","whichend":"close"},{"chars":"//","name":"comment","type":"containing","close":["\n"],"state":"off","domlevel":"inline","parent":"code","whichend":"open"},{"chars":"```","name":"code","type":"complex","overrideouter":false,"innerrules":[{"chars":"//","name":"comment","type":"containing","close":["\n"]}],"state":"on","domlevel":"inline","close":["```"],"whichend":"open"}],
    //         domlevelStack : [],
    //         domlevel : 'block',
    //         // contextIds : [{"~":"escape"},{"##":"h2.open"},{"//":"italics.open"},{"```":"code.open"}],
    //         escapeChar : '~',
    //         junk : '',
    //         idBuffer : [],
    //         // filteredIds : [{"~":"escape"},{"##":"h2.open"},{"//":"italics.open"},{"```":"code.open"}],
    //         output : []
    //     }, parser.setup, [mockGrammar], parser, true);
    // // GETIDNAME
    // tester.set('getIdName returning name', 'getIdName not working', 'h2.open', parser.getIdName, [mockIdList, '##'], parser, true);
    // // FILTERIDLISTBYCHARTOKEN:
    // tester.set('filterIdListByCharToken returning filtered list', 'filterIdListByCharToken not working', [{'//':'italics.open'}], parser.filterIdListByCharToken, [mockIdList, 1, '/'], parser, true);
    // // COMBINE RULES!
    // tester.set('combineRules working correctly', 'combineRules not working', [{"chars":"~","name":"escape","type":"escape","domlevel":"inline"},{"chars":"##","name":"h2","type":"containing","domlevel":"blockonly","close":["##"]},{"chars":"//","name":"comment","type":"containing","domlevel":"inline","close":["\n"]},{"chars":"```","name":"code","type":"complex","overrideouter":false,"innerrules":[{"chars":"//","name":"comment","type":"containing","domlevel":"inline","close":["\n"]}],"domlevel":"block","close":["```"]}], parser.combineRules, [mockGrammar.rules, subRules], parser, true);
    // // GETIDINDEX:
    // tester.set('getIdIndex returning correct index num', 'getIdIndex not working', 1, parser.getIdIndex, [mockIdList, '##', 'h2.open'], parser,true);
});







// // TESTING PARSER:
// tester.envs.push(function () {
//     var parser = new Parser(true);
//     var rules = defaultRules;
//     var grammar = new Grammar();
//     grammar.initialize(rules);
//     var tokenizer = new Tokenizer();

//     var text = "##here is some //simple// text##";
//     var tokenized = tokenizer.tokenize(grammar.specialChars, text);

//     // SIMPLE TEXT TEST
//     tester.set('parser working', 'parser not working', ['h2.open','here is some ','italics.open','simple','italics.close',' text','h2.close'], parser.parse, [grammar,tokenized], parser);

// });

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
