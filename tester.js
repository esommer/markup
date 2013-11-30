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
			try {
                var output = JSON.stringify(test.fxn.apply(test.scopeVar,test.vars));
                var exp = JSON.stringify(test.expected);
				if (output === exp) {
                    process.stdout.write('.');
                    this.score.passed++;
                    if (test.quiet !== true) {
					   this.results.push({p:test.success, result: output + " === " + exp});
                    }
				}
				else {
                    this.score.failed++;
                    process.stdout.write('_');
                    if (test.quiet !== true) {
					   this.results.push({f:test.fail, result: output + " !== " + exp});
                    }
				}
			}
			catch (e) {
                this.score.ERRs++;
                process.stdout.write('E');
                if (test.quiet !== true) {
				    this.results.push({ff:test.fail, result: e});
                }
			}
		}, this);
	},
	set : function (onSuccess, onFail, isExpected, theFxn, theVars, quiet) {
        var test = new Test(arguments);
		this.tests.push(test);
        return test;
	},
	display : function (detailed) {
		var toPrint = '\nSCORE:\n\tpassed: ' + this.score.passed + '\n\tfailed: ' + this.score.failed + '\n\tERRs: ' + this.score.ERRs + '\n\n';
        if (detailed) {
            toPrint += 'DETAILS:\n'
            this.results.forEach(function(result){
                toPrint += Object.getOwnPropertyNames(result)[0] + ': '+ result[Object.getOwnPropertyNames(result)[0]] + '\n';
                if (result.result !== undefined) {
                    toPrint += '\t' + result.result + '\n';
                }
            },this);
        }
		return toPrint;
	}
};

module.exports = Tester;
