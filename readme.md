markup
=======

A JavaScript custom markdown maker. This will eventually allow a user to edit a set of markdown rules, enter text formatted with those rules, and the app will output html (determined according to the user's markdown rules). I haven't yet finished parsing complex elements, nor have I built a frontend. It does, however, accept any rules for simple open/close elements (ex: <em></em>), and can be run in node.

####To use:
Download into a folder that has access to node.js. Open markup.js and set your own rules, each follows the pattern:
```javascript
{
    chars: '**' // whatever characters you want to denote opening and closing the element -- can be 1+ characters
    name: 'bold' // this is for the user's reference, not necessary
    type: 'containing' // this is the only type currently supported (other than the escape character)
    start: '<b>' // the opening html tag
    end: '</b>' // the closing html tag
}
```
Next replace the testing text in the text variable, using your defined symbols to denote html tags. Save, then in whatever directory you've placed this and the required files, run "node markup.js", and your new html will print to the console!

###Next steps:
A UI for this, allowing user editing of rules, user input of text, display of output html, downloading of the whole modified converter file text (so the user can save the js file and run it in their browser whenever they'd like).

Also, before the UI, I still have a lot more parsing work to do. Next up: support complex rules that contain other important information within them (ex: img tags with src and alt). I also want to be able to generate infinitely nested lists. One thing at a time!


mini-tester
============

Alongside the markup-maker, I've written my own mini testing framework, for the best way to understand the importance of others' frameworks is to try a "simple" implementation of your own.

####To use:
See testRunner.js for the example, but first put the tester.js file in the folder where your script resides (or somewhere the test script can access), then create a new file for the tests in which you will 'require' your files and the tester.js file, and instantiate a new Tester object:
```javascript
var Tester = require('./tester.js');
var yourClass = require('./YourClass.js');

var tester = new Tester();

```
Then create an environment for each set of tests that you want to run, within which you declare variables that the test will need and write the test. Tests are set with "this.set()" within the environment, and they take 5 or 6 parameters:
- on success message
- on fail message
- expected results
- function to call
- parameters to pass in inside an array
- 'this' scope to call function on
- [optional] true sets the test to quiet itself (does not output details -- only adds itself as a pass, fail or error)

```javascript
tester.envs.push(function() {
   var blah = "something important";
   var myClass = new MyClass();
   myClass.setup();
   this.set('my test worked!', 'my test failed', 'outputted stuff', myClass.doSomething, ['inputted data'], myClass);
});

```
Once you've written all your tests, call tester.build() and console.log(tester.display(1));. If you then run this file (node filename.js), you will see your test results as follows:
```javascript
..._..E  // . = success; _ = fail; E = exception error;

SCORE:
    passed: 5
    failed: 1
    ERRS: 1

DETAILS:
p: my test worked!  // here are details for tests that you have not "quieted"
    'outputted stuff' === 'outputted stuff'
```

###Next steps:
Have it list filename and line number on fails and errors.

License
-------
None so far.
