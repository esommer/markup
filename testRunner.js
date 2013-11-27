var tester = require('./tester.js');
var Marker = require('./marker.js');



// TESTING PARSER:

// set escape character correctly
// (requires that marker.parseRules be set to return escapeChar)
tester.envs.push(function() {
    var rules = [{ chars : '~', type : 'escape' }];
    var marker = new Marker();
    this.set('marker.parseRules sets escape char', 'marker.parseRules not setting escape char', '~', marker.parseRules,[rules], marker)
        .quiet(true);
});

// catch errors in escape character rule!
tester.envs.push(function() {
    var rules = [{ chars : '~~', type : 'escape' }];
    var marker = new Marker();
    this.set('marker.parseRules barfs at two character escape rule', 'marker.parseRules not catching two character escape error', 'parseRulesError: Escape character must be ONE character; ', marker.parseRules,[rules], marker)
    .quiet(true);
});
// _________________________



// TESTING MARKER:
tester.envs.push(function () {
    var rules = [
        {
            chars : '~',
            type : 'escape'
        },
        {
            chars: '**',
            type : 'containing'
        }
    ];
    var marker = new Marker(rules);

    // initial tokenizing:
    tester.set('marker.read tokenizing text','marker.read not tokenizing correctly', ['t','o','k','e','n','i','z','e',' ','m','e','!',' ','~','<','#','b','l','a','h','\n','n','e','w','l','i','n','e','.','.','.'] ,marker.read, ['tokenize me! ~<#blah\nnewline...'], marker).quiet();

    // binding escape character to following tokens:
    tester.set('marker.bindEscapes working', 'marker.bindEscapes not working', ['~#',' ','t','e','s','t','~!',' ','#',' ','~ ','?'], marker.bindEscapes,[marker.read('~# test~! # ~ ?')], marker).quiet();
});
// _________________________



// RUN TESTS!
tester.build();
console.log(tester.display(1));
