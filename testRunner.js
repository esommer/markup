var tester = require('./tester.js');
var marker = require('./marker.js');


// make sure tester is working properly:
tester.describe('success','failure','result',function(x){return x;},['result']);





















// RUN OUR TESTS!
tester.run();

// DISPLAY OUR RESULTS:
console.log(tester.display(1));
