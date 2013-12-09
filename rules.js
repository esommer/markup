// GRAMMAR WILL HAVE TO ADD A CLOSE KEY TO EACH WHICH CONTAINS AN ARRAY OF POSSIBLE CLOSING CHARS

// DEFAULT SET OF RULES:
var rules = [
// ESCAPE:
    {
        name: 'escape',
        chars: '~',
        type: 'escape'
    },
// SINGLETONS:
    {
        name: 'hr',
        chars: '----',
        type: 'singleton',
        html: '<hr />'
    },
    {
        name: 'br',
        chars: '\n',
        type: 'singleton',
        html: '<br />'
    },
// CONTAININGS:
    {
        name: 'bold',
        chars: '**',
        type: 'containing',
        domlevel: 'inline',
        start: '<b>',
        end: '</b>'
    },
    {
        name: 'italics',
        chars: '//',
        type: 'containing',
        domlevel: 'inline',
        start: '<em>',
        end: '</em>'
    },
    {
        name: 'strikethrough',
        chars: '--',
        type: 'containing',
        domlevel: 'inline',
        start: '<span class="strikethrough">',
        end: '</span>'
    },
    {
        name: 'underline',
        chars: '__',
        type: 'containing',
        domlevel: 'inline',
        start: '<span class="underline">',
        end: '</span>'
    },
// separate close chars:
    {
        name: 'span',
        chars: '((',
        close: ['))'],
        type: 'containing',
        domlevel: 'inline',
        start: '<span>',
        end: '</span>'
    },
// multiple close chars:
    {
        name: 'h1',
        chars: '#',
        close: ['#','\n'],
        type: 'containing',
        domlevel: 'blockonly',
        start: '<h1>',
        end: '</h1>'
    },
    {
        name: 'h2',
        chars: '##',
        close: ['##','\n'],
        type: 'containing',
        domlevel: 'blockonly',
        start: '<h2>',
        end: '</h2>'
    },
    {
        name: 'h3',
        chars: '###',
        close: ['###','\n'],
        type: 'containing',
        domlevel: 'blockonly',
        start: '<h3>',
        end: '</h3>'
    },
    {
        name: 'h4',
        chars: '####',
        close: ['####','\n'],
        type: 'containing',
        domlevel: 'blockonly',
        start: '<h4>',
        end: '</h4>'
    },
    {
        name: 'h5',
        chars: '#####',
        close: ['#####','\n'],
        type: 'containing',
        domlevel: 'blockonly',
        start: '<h5>',
        end: '</h5>'
    },
    {
        name: 'h6',
        chars: '######',
        close: ['######','\n'],
        type: 'containing',
        domlevel: 'blockonly',
        start: '<h6>',
        end: '</h6>'
    },
// COMPLEX
    {
        name: 'code',
        chars: '```',
        close: ['```','\n\n'],
        type: 'complex',
        domlevel: 'block',
        start: '<code>',
        end: '</code>',
        overrideouter: false,
        innerrules: [
            {
                name: 'comment',
                chars: '//',
                close: ['\n'],
                type: 'containing',
                domlevel: 'inline',
                start: '<span class="comment">',
                end: '</span>'
            },
            {
                name: 'escape',
                chars: '\\',
                type: 'escape'
            }
        ]
    }
];

module.exports = rules;
