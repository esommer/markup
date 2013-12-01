var Tester = require('./tester.js');
var Parser = require('./parser.js');
var Marker = require('./marker.js');
var Array = require('./arrFxns.js');

var tester = new Tester();

// TESTING ARRAY FUNCTIONS:
tester.envs.push(function () {
    var arr = ['a','b','c'];
    var objArr = [ { name: 'test', meat: 'pork'}, { name: 'working', meat: 'fish' } ];
    var toFilter = [ 'peg', 'fell', 'noble', 'melt'];
    // array.last()
    tester.set('Array.last() returns last element in array', 'Array.last() not working', 'c', arr.last, [], arr, true);
    // array.inArray(item)
    tester.set('Array.inArray() returns item index', 'Array.inArray() not working', 1, arr.inArray, ['b'], arr, true);
    // get matching key val from array of objs array.fetchObjByKeyVal(keyName, val)
    tester.set('Array.fetchObjByKeyVal() returns object', 'Array.fetchObjByKeyVal() not working', {"name":"test","meat":"pork"}, objArr.fetchObjByKeyVal, ['name','test'], objArr, true);
    tester.set('Array.filterByCharAtVal returns filtered array', 'Array.filterByCharAtVal not working', ['peg','fell','melt'], toFilter.filterByCharAtVal, [1,'e'], toFilter, true);
});

// TESTING PARSER:

// set escape character correctly
// (requires that marker.parseRules be set to return escapeChar)
tester.envs.push(function() {
    var rules = [{ chars : '~', type : 'escape' }];
    var parser = new Parser();
    parser.readRules(rules);
    tester.set('marker.parseRules sets escape char', 'marker.parseRules not setting escape char', '~', parser.getEscape, [], parser, true);
});
// catch errors in escape character rule!
tester.envs.push(function() {
    var rules = [{ chars : '~~', type : 'escape' }];
    var parser = new Parser();
    parser.readRules(rules);
    tester.set('marker.parseRules barfs at two character escape rule', 'marker.parseRules not catching two character escape error', 'parseRulesError: Escape character must be ONE character; ', parser.getErrors,[], parser, true);
});

// check containers list
tester.envs.push(function () {
    var rules = [{ chars : '~', type : 'escape' }, { chars: '**', type: 'containing' }, { chars: '//', type: 'containing'}, { chars: '\n\t', type: 'containing'}, { chars: '######', type: 'containing'}, { chars: '#', type: 'containing'}, { chars: '##', type: 'containing'}];
    var parser = new Parser();
    parser.readRules(rules);

    // containers are added correctly
    tester.set('parser adds each containing element to container watcher', 'parser not adding containing elements correctly', ['**', '//', '\n\t','######','#','##'], parser.getContainers, [], parser, true);

    // parser.sort puts longest items first
    tester.set('parser.sortContainers puts longest items first', 'parser.sortContainers not working', ['######','**', '//', '\n\t','##','#'], parser.sortContainers, [parser.getContainers()], parser, true);
});
// _________________________



// TESTING MARKER:
tester.envs.push(function () {
    var rules = [{ chars : '~', type : 'escape' }, { chars: '**', type: 'containing' }, { chars: '//', type: 'containing'}, { chars: '\n\t', type: 'containing'}, { chars: '######', type: 'containing'}];
    var marker = new Marker(rules);

    // clean: \r => \n
    tester.set('marker.clean replaces returns with newlines', 'marker.clean not working', '\ntext\n\n', marker.clean, ['\rtext\r\n'], marker, true);

    // initial tokenizing:
    tester.set('marker.read tokenizing text','marker.read not tokenizing correctly', ['t','o','k','e','n','i','z','e',' ','m','e','!',' ','~','<','#','b','l','a','h','\n','n','e','w','l','i','n','e','.','.','.'] ,marker.read, ['tokenize me! ~<#blah\nnewline...'], marker, true);

    // binding escape character to following tokens:
    tester.set('marker.bindEscapes working', 'marker.bindEscapes not working', ['~#',' ','t','e','s','t','~!',' ','#',' ','~ ','?'], marker.bindEscapes,[marker.read('~# test~! # ~ ?')], marker, true);
});

tester.envs.push(function () {
   var rules = [{ chars : '~', type : 'escape' }, { chars: '**', type: 'containing' }, { chars: '//', type: 'containing'}, { chars: '\n\t', type: 'containing'}, { chars: '######', type: 'containing'}, { chars: '#', type: 'containing'}, { chars: '##', type: 'containing'}];
    var marker = new Marker(rules);
    var textArray = marker.bindEscapes(marker.read('###### test //here//'));

    // addToOutput returns opening chars of new stack
    tester.set('marker.addToOutput returns chars if opening new container', 'marker.addToOutput not returning chars for opening of new container', '**', marker.addToOutput, [{ chars: '**', name: 'bold', type: 'containing', start: '<b>', end: '</b>' }, false], marker, true);

    // addToOutput returns undefined, signaling close of openStack
    tester.set('marker.addToOutput returns undefined if closing container', 'marker.addToOutput not returning undefined', undefined, marker.addToOutput, [{ chars: '**', name: 'bold', type: 'containing', start: '<b>', end: '</b>' }, true], marker, true);
});

tester.envs.push(function () {
   var rules = [{ chars : '~', name: 'escape', type : 'escape' }, { chars: '**', name: 'bold', type: 'containing', start: '<b>', end: '</b>' }, { chars: '//', name: 'italics', type: 'containing', start: '<em>', end: '</em>'}, { chars: '######', name: 'h6', type: 'containing', start:'<h6>', end:'</h6>'}, { chars: '#', name: 'h1', type: 'containing', start: '<h1>', end: '</h1>'}, { chars: '##', name: 'h2', type: 'containing', start: '<h2>', end: '</h2>'}];
    var marker = new Marker(rules);
    var textArray = marker.bindEscapes(marker.read('## test //here// ##'));

    //check bindSequences
    tester.set('marker.bindSequences working', 'marker.bindSequences not working', '<h2> test <em>here</em> </h2>', marker.bindSequences, [textArray], marker, false);
});
// _________________________



// RUN TESTS!
tester.build();
console.log(tester.display(1));
