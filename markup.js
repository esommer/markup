var Parser = require('./parser.js');
var Marker = require('./marker.js');
var Array = require('./arrFxns.js');

var rules = [
    {
        chars : '~',
        name: 'escape',
        type : 'escape'
    },
    {
        chars: '**',
        name: 'bold',
        type: 'containing',
        start: '<b>',
        end: '</b>'
    },
    {
        chars: '//',
        name: 'italics',
        type: 'containing',
        start: '<em>',
        end: '</em>'
    },
    {
        chars: '######',
        name: 'h6',
        type: 'containing',
        start:'<h6>',
        end:'</h6>'
    },
    {
        chars: '#',
        name: 'h1',
        type: 'containing',
        start: '<h1>',
        end: '</h1>'
    },
    {
        chars: '##',
        name: 'h2',
        type: 'containing',
        start: '<h2>',
        end: '</h2>'
    }
];

var marker = new Marker(rules);
var text = '## test //here// ##';

console.log(marker.process(text));
