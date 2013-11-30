var Tester = require('./tester.js');
var Parser = require('./parser.js');
var Marker = require('./marker.js');

var tester = new Tester();


// TESTING PARSER:

// set escape character correctly
// (requires that marker.parseRules be set to return escapeChar)
tester.envs.push(function() {
    var rules = [{ chars : '~', type : 'escape' }];
    var parser = new Parser();
    parser.readRules(rules);
    this.set('marker.parseRules sets escape char', 'marker.parseRules not setting escape char', '~', parser.getEscape, [], parser, true);
});
// catch errors in escape character rule!
tester.envs.push(function() {
    var rules = [{ chars : '~~', type : 'escape' }];
    var parser = new Parser();
    parser.readRules(rules);
    this.set('marker.parseRules barfs at two character escape rule', 'marker.parseRules not catching two character escape error', 'parseRulesError: Escape character must be ONE character; ', parser.getErrors,[], parser, true);
});

// check containers list
tester.envs.push(function () {
    var rules = [{ chars : '~', type : 'escape' }, { chars: '**', type: 'containing' }, { chars: '//', type: 'containing'}, { chars: '\n\t', type: 'containing'}, { chars: '######', type: 'containing'}, { chars: '#', type: 'containing'}, { chars: '##', type: 'containing'}];
    var parser = new Parser();
    parser.readRules(rules);

    // containers are added correctly
    this.set('parser adds each containing element to container watcher', 'parser not adding containing elements correctly', ['**', '//', '\n\t','######','#','##'], parser.getContainers, [], parser, true);

    // parser.sort puts longest items first
    this.set('parser.sortContainers puts longest items first', 'parser.sortContainers not working', ['######','**', '//', '\n\t','##','#'], parser.sortContainers, [parser.getContainers()], parser, true);
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

    // testing inArray returns undefined if item not in array
    tester.set('marker.inArray returns undefined if item not in array', 'marker.inArray not returning undefined as expected', undefined, marker.inArray, ['#',['t','?','f']], marker, true);

    // testing inArray returns item index if item in array
    tester.set('marker.inArray returns index', 'marker.inArray not returning index', 3, marker.inArray, ['#',['t',' ','\n','#','f']], marker, true);

    // check maxLength
    tester.set('marker.setMaxLength returns longest maxLength','marker.setMaxLength not working', 6, marker.setMaxLength, [], marker, true);

    // check triggers
    tester.set('marker.setTriggers returns longest maxLength','marker.setTriggers not working', ['#','*','/','\n','#','#'], marker.setTriggers, [], marker, true);

    // check chunkOnEscapes
    tester.set('marker.chunkOnEscapes returning array of pieces', 'marker.chunkOnEscapes not returning array of pieces', ['here is','~#',' at','~e','st'], marker.chunkOnEscapes, [['h','e','r','e',' ','i','s','~#',' ','a','t','~e','s','t']], marker, true);

    //check bindSequences
    tester.set('marker.bindSequences working', 'marker.bindSequences not working', [], marker.bindSequences, [textArray], marker, false);
});
// _________________________



// RUN TESTS!
tester.build();
console.log(tester.display(1));
