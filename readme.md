markup
=======

A JavaScript custom markdown maker. Ideally this will eventually allow a user to customize markdown rules and apply them to some text to output html. At the moment, it is quite in-the-works.

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

To Do:
------
Everything. No point listing things right now: this is a new project, and there's loads to do!

License
-------
None so far.
