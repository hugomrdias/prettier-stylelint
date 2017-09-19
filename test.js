'use strict';

const fs = require('fs');
const test = require('ava');
const tempWrite = require('temp-write');
const { format, resolveConfig } = require('./index');

test('resolveConfig', t =>
    resolveConfig('./fixtures/style.css').then(config =>
        t.deepEqual(config[1], {
            rules: {
                'string-quotes': ['single'],
                'indentation': [4, { except: ['value'] }],
                'color-hex-case': ['upper'],
                'color-hex-length': ['short'],
                'block-no-empty': null,
                'color-no-invalid-hex': [true],
                'comment-empty-line-before': [
                    'always',
                    { ignore: ['stylelint-commands', 'after-comment'] }
                ],
                'declaration-colon-space-after': ['always'],
                'max-empty-lines': [2],
                'rule-empty-line-before': [
                    'always',
                    {
                        except: ['first-nested'],
                        ignore: ['after-comment']
                    }
                ],
                'unit-whitelist': [['em', 'rem', '%', 's']]
            }
        })
    ));

test('resolveConfig not found', (t) => {
    const tempPath = tempWrite.sync(
        'a[id="foo"] { content: "x"; }',
        'test.css'
    );

    return resolveConfig(tempPath)
        .then((config) => {
            console.log(config);

            return config;
        })
        .catch((err) => {
            console.log(err);
            t.pass();
        });
});

test('format', (t) => {
    const source = fs.readFileSync('./fixtures/style.css', 'utf8');

    return format({
        text: source,
        filePath: './fixtures/style.css'
    }).then((source) => {
        t.is(
            source,
            `@media print {
    a {
        color: #FFF;
        background-position: top left, top right;
    }
}

a[id='foo'] {
    content: 'x';
}
`
        );

        return source;
    });
});

test('format less', (t) => {
    const source = fs.readFileSync('./fixtures/less.less', 'utf8');

    return format({
        text: source,
        filePath: './fixtures/less.less'
    }).then((source) => {
        t.is(
            source,
            `@base: #F938AB;

.box-shadow(@style, @c) when(iscolor(@c)) {
    -webkit-box-shadow: @style @c;
    box-shadow: @style @c;
}
.box-shadow(@style, @alpha: 50%) when(isnumber(@alpha)) {
    .box-shadow(@style, rgba(0, 0, 0, @alpha));
}

.box {
    color: saturate(@base, 5%);
    border-color: lighten(@base, 30%);

    div {
        .box-shadow(0 0 5px, 30%);
    }
}
`
        );

        return source;
    });
});
