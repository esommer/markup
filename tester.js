var Tester = function () {
	this.tests = [];
	this.results = [];
    this.score = {
        passed: 0,
        failed: 0,
        ERRs: 0
    };
};

Tester.prototype = {
	run : function () {
		this.tests.forEach(function (test) {
			try {
				if (JSON.stringify(test.fxn.apply(undefined,test.vars)) === JSON.stringify(test.expected)) {
					this.results.push({p:test.success, result: test.fxn.apply(undefined,test.vars) + " === " + test.expected});
                    this.score.passed++;
				}
				else {
					this.results.push({f:test.fail, result: test.fxn.apply(undefined,test.vars)});
                    this.score.failed++;
				}
			}
			catch (e) {
				this.results.push({ff:test.fail, result: e});
                this.score.ERRs++;
			}
		}, this);
		return this.results;
	},
	describe : function (onSuccess, onFail, isExpected, theFxn, theVars) {
		this.tests.push({
			success: onSuccess,
			fail: onFail,
			expected: isExpected,
			fxn: theFxn,
			vars: theVars
		});
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

var test = new Tester();

module.exports = test;


