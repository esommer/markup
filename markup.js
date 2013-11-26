var Marker = (function (exports) {
	var markMap = {
		'#' : {
			name: 'h1',
			kind: 'double'
		}
		'##' : {
			name : 'h2',
			kind : 'double'
		}
		'###' : {
			name : 'h3',
			kind : 'double'
		}
		'####' : {
			name : 'h4',
			kind : 'double'
		}
		'#####' : {
			name : 'h5',
			kind : 'double'
		}
		'######' : {
			name : 'h6',
			kind : 'double'
		}
		'/' : {
			name : 'em',
			kind : 'double'
		}
		'*' : {
			name : 'b',
			kind : 'double'
		}
		'------' : {
			name : 'hr',
			kind : 'single'
		}
		'\\' : {
			name : 'br',
			kind : 'single'
		}
		'~' : {
			name : 'esc',
			kind : 'escape'
		}
	};
	var replacer = function (text) {
		var charArray = text.split();
		var finalStack = [];
		var memStack = [];
		var pusher = '';
		for (var i=0; i<charArray.length; i++) {
			var ch = charArray[i];

			if (ch in Object.keys(markMap) {
				if (markMap(ch).kind === 'double') {
					charArray[i] = '<' + ch + '>';
					memStack.push(ch);
					pusher = ch;
				}
				else if (markMap(ch).kind === 'single') {
					charArray[i] = '<' + ch + ' />';
				}
			}

			if (pusher !== '') {
				memStack.push(ch);
			}
			else {
				finalStack.push(ch);
			}
		}
	};
	exports = {};
})(this);

var marked = new Marker();
marked