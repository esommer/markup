var Test = function (args) {
    this.success = args[0],
    this.fail = args[1],
    this.expected = args[2],
    this.fxn = args[3],
    this.vars = args[4],
    this.scopeVar = args[5],
    this.quiet = args[6]
};

var Tester = function () {
	this.tests = [];
	this.results = [];
    this.score = {
        passed: 0,
        failed: 0,
        ERRs: 0
    };
    this.envs = [];
    this.displayOptions = {
        showDetails : true,
        showStacksOnError : true
    };
};

Tester.prototype = {
    build : function () {
        process.stdout.write('\n');
        this.envs.forEach(function (env) {
            env.call(this);
            this.run();
            this.tests = [];
        }, this);
        process.stdout.write('\n');
        return this.results;
    },
	run : function () {
		this.tests.forEach(function (test) {
            var connectorSuccess = " === ";
            var connectorFail = " !== ";
			try {
                var output = JSON.stringify(test.fxn.apply(test.scopeVar,test.vars));
                if (output) {
                    connectorSuccess = output.length > 20? "\n===\n    ": " === ";
                    connectorFail = output.length > 20? "\n!==\n    ": " !== ";
                }
                var exp = JSON.stringify(test.expected);
				if (output === exp) {
                    process.stdout.write('.');
                    this.score.passed++;
                    if (test.quiet !== true) {
				        this.results.push({p:test.success, result: output + connectorSuccess + exp});
                    }
				}
				else {
                    this.score.failed++;
                    process.stdout.write('_');
					this.results.push({f:test.fail, result: output + connectorFail + exp});
				}
			}
			catch (e) {
                this.score.ERRs++;
                process.stdout.write('E');
				this.results.push({ff:test.fail, result: e, stack: e.stack.replace(e,'').replace(/\//g, '\/\/').replace(/\/[\w]+\//g, '').replace(/\/\//g, '').replace(/[ ]{4}/g, '        ') + '\n    ___________________________________________'});
			}
		}, this);
	},
	set : function (onSuccess, onFail, isExpected, theFxn, theVars, quiet) {
        var test = new Test(arguments);
		this.tests.push(test);
        return test;
	},
	display : function () {
		var toPrint = '\nSCORE:\n    passed: ' + this.score.passed + '\n    failed: ' + this.score.failed + '\n    ERRs: ' + this.score.ERRs + '\n\n';
        if (this.displayOptions.showDetails) {
            toPrint += 'DETAILS:\n'
            this.results.forEach(function(result){
                toPrint += Object.getOwnPropertyNames(result)[0] + ': '+ result[Object.getOwnPropertyNames(result)[0]];
                if (result.result !== undefined) {
                    toPrint += '\n    ' + result.result;
                }
                if (this.displayOptions.showStacksOnError && result.stack !== undefined) {
                    toPrint += '    ' + result.stack;
                }
                toPrint += '\n\n';
            },this);
        }
		return toPrint;
	}
};

module.exports = Tester;
