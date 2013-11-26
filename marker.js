var Marker = function () {
    this.text = '';
    this.tokens = [];
    this.result = '';
    this.chars = ['#','/','~','-','_','*','`'];
    this.charMap = {
        '####' : {
            chars: '####',
            name: 'h4',
            type: 'containing',
            start: '<h4>',
            end: '</h4>'
        },
                           '----' : {
            chars: '----',
            name: 'hr',
            type: 'singleton',
            html: '<hr />'
        },
        '###' : {
            chars: '###',
            name: 'h3',
            type: 'containing',
            start: '<h3>',
            end: '</h3>'
        },
        '```' : {
            chars: '```',
            name: 'codeblock',
            type: 'containing',
            start: '<pre>',
            end: '</pre>'
        },
        '##' : {
            chars: '##',
            name: 'h2',
            type: 'containing',
            start: '<h2>',
            end: '</h2>'
        },
        '//' : {
            chars: '//',
            name: 'italics',
            type: 'containing',
            start: '<em>',
            end: '</em>'
        },
        '--' : {
            chars: '--',
            name: 'crossout',
            type: 'containing',
            start: '<span class="crossout">',
            end: '</span>'
        },
        '__' : {
            chars: '__',
            name: 'underline',
            type: 'containing',
            start: '<span class="underline">',
            end: '</span>'
        },
        '**' : {
            chars: '**',
            name: 'bold',
            type: 'containing',
            start: '<b>',
            end: '</b>'
        },
        '#' : {
            chars:'#',
            name: 'h1',
            type: 'containing',
            start: '<h1>',
            end: '</h1>'
        },
        '~' : {
            chars: '~',
            name: 'tilda',
            type: 'escape'
        },
        '{{' : {
            chars: '{{',
            name: 'startlink',
            type: 'containing',
            start: '<a href="',
            end: '">'
        },
        '}}' : {
            chars: '}}',
            name: 'endlink',
            type: 'singleton',
            html: '</a>'
        },
        '|' : {
            chars: '|',
            name: 'pipe',
            type: 'separator'
        }
    };
    this.codeRules = {
        '//' : {
            chars: '//',
            name: 'slashcomment',
            type: 'comment',
            start: '<span class="comment"',
            end: '</span>'
        },
        '#' : {
            chars: '#',
            name: 'octocomment',
            type: 'comment',
            start: '<span class="comment"',
            end: '</span>'
        },
        '*': {
            chars: '*',
            name: 'bold',
            type: 'containing',
            start: '<b>',
            end: '</b>'
        }
    };
};

Marker.prototype = {
    read : function (text) {
        this.text = text;
        this.tokens = this.text.split('');
        return this.tokens;
    },
    regroup : function (tokens, done) {
        var done = done;
        if (done === undefined) done = new Array();
        var special = '';
        if (tokens.length === 0) return done;
        if (Object.keys(this.charMap).indexOf(tokens.slice(0,4).join('')) !== -1) {
            special = tokens.slice(0,4).join('');
        }
        else if (Object.keys(this.charMap).indexOf(tokens.slice(0,3).join('')) !== -1) {
            special = tokens.slice(0,3).join('');
        }
        else if (Object.keys(this.charMap).indexOf(tokens.slice(0,2).join('')) !== -1) {
            special = tokens.slice(0,2).join('');
        }
        else if (Object.keys(this.charMap).indexOf(tokens[0]) !== -1) {
            special = tokens[0] === '~'? tokens.slice(0,2).join(''): special = tokens[0];
        }
        else {
            done[done.length] = tokens[0];
            return this.regroup(tokens.slice(1,tokens.length), done);
        }
        if (special !== '') {
            done[done.length] = special;
            return this.regroup(tokens.slice(special.length, tokens.length), done);
        }
    },
    handleLinks : function (tokens, results, openStack) {
        var result = '';
        var fxn = this.handleLinks;
        switch (tokens[0]) {
            case ('{{') :
                result = this.charMap['{{'].start;
                break;
            case ('|') :
                result = this.charMap['{{'].end;
                if (results.slice(results.length-1,results.lenth) === " ") {
                    results = results.slice(0,results.length-1);
                }
                if (tokens[1] === " ") {
                    tokens = tokens.slice(1, tokens.length);
                }
                break;
            case ('}}') :
                result = this.charMap['}}'].html;
                fxn = this.tokensToHTML;
                break;
            default :
                result = tokens[0];
                break;
        }
        results += result;
        return fxn.call(this, tokens.slice(1, tokens.length), results, openStack);
    },
    handleULs : function (tokens, results, openStack) {
        // var result = '';
        // var fxn = this.handleULs;
        // if (tokens[0])
    },
    handleCode : function (tokens, results, openStack) {
        var result = '';
        var fxn = this.handleCode;
        var sliceTokens = true;
        if (openStack.length > 0 && this.codeRules[openStack[openStack.length - 1]] !== undefined && this.codeRules[openStack[openStack.length - 1]].type === 'comment' && tokens[0] === '\n' ) {
            result += this.codeRules[openStack[openStack.length - 1]].end;
            sliceTokens = false;
            openStack.shift();
        }
        else if (openStack.length > 0 && openStack[openStack.length - 1] === tokens[0]) {
            result += this.codeRules[tokens[0]].end;
            openStack.shift();
        }
        else if (Object.keys(this.codeRules).indexOf(tokens[0]) !== -1) {
            switch (this.codeRules[tokens[0]].type) {
                case ('singleton'):
                    result += this.codeRules[tokens[0]].html;
                    break;
                case ('comment'):
                case ('containing'):
                    result += this.codeRules[tokens[0]].start;
                    openStack.push(this.codeRules[tokens[0]].chars);
                    break;
                default:
                    break;
            }
        }
        else if (tokens[0] === '```') {
            result += this.charMap['```'].end;
            fxn = this.tokensToHTML;
        }
        else {
            result += tokens[0];
        }
        results += result;
        tokens = sliceTokens? tokens.slice(1,tokens.length): tokens;
        return fxn.call(this, tokens, results, openStack);
    },
    tokensToHTML : function (tokens, result, openStack) {
        if (tokens.length === 0) return result;
        var result = result === undefined? '' : result;
        var openStack = openStack === undefined? new Array() : openStack;
        if (openStack.indexOf('ul') !== -1) { console.log('yes'); }
        console.log(openStack);
        // if (openStack['ul'] !== undefined && tokens[0] === '\n') {
        //     if (openStack
        //     var i = 1
        //     if (tokens[1])
        // }
        if (tokens[0] === '\n' && tokens[1] === '\t' && Object.keys(openStack).indexOf('ul') === -1) {
            result += '<ul><li>';
            openStack.push('ul');
            openStack.push('li');
        }
        else if (tokens[0] === '{{') {
            return this.handleLinks(tokens, result, openStack);
        }
        else if (tokens[0] === '```') {
            result += this.charMap['```'].start;
            return this.handleCode(tokens.slice(1, tokens.length), result, openStack);
        }
        else if (openStack.length > 0 && openStack[openStack.length - 1] === tokens[0]) {
            result += this.charMap[tokens[0]].end;
            openStack.shift();
        }
        else if (tokens[0].charAt(0) === '~') {
            result += tokens[0].slice(1,tokens[0].length);
        }
        else if (Object.keys(this.charMap).indexOf(tokens[0]) !== -1) {
            switch (this.charMap[tokens[0]].type) {
                case ('singleton') :
                    result += this.charMap[tokens[0]].html;
                    break;
                case ('containing'):
                    result += this.charMap[tokens[0]].start;
                    openStack.push(this.charMap[tokens[0]].chars);
                    break;
                default:
                    break;
            }
        }
        else {
            result += tokens[0];
        }
        return this.tokensToHTML(tokens.slice(1, tokens.length), result, openStack);
    },
    print : function () {
        return this.result;
    }
};

var markup = new Marker();

module.exports = markup;
