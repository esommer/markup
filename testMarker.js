var text = require('./text.js');
var marker = require('./marker.js');
var tester = require('./tester.js');

//marker.read(text);

//tester.describe('marker.read() tokenizes text','marker.read not tokenizing text',text.split(''),marker.read,[text]);
//tester.run();

var simpleText = "and {{http://google.com | links}}.\n\nIt should";

console.log(marker.tokensToHTML(marker.regroup(marker.read(text))));

//console.log(tester.display());
