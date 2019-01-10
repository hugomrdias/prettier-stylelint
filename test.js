'use strict';

const fs = require('fs');
const test = require('ava');
const tempWrite = require('temp-write');
const stylelint = require('stylelint');
const { format, resolveConfig, getPrettierConfig } = require('./index');

const linterAPI = stylelint.createLinter({ fix: true });

test('resolveConfig', t =>
    resolveConfig({ filePath: './fixtures/style.css' }).then(config =>
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

test('resolveConfig not found fallback process.cwd', (t) => {
    const tempPath = tempWrite.sync(
        'a[id="foo"] { content: "x"; }',
        'test.css'
    );

    return resolveConfig({ filePath: tempPath }).then((config) => {
        t.is(config[1].rules['function-comma-newline-after'], null);

        return config;
    });
});

test('resolveConfig shortcircuit ', t =>
    resolveConfig({ stylelintConfig: { rules: { 'max-line-length': [20] } } }).then((config) => {
        t.is(config[0].printWidth, 20);

        return config;
    }));

test('resolve string quotes === double ', (t) => {
    const config = resolveConfig.resolve({ rules: { 'string-quotes': ['double'] } });

    t.is(config[0].singleQuote, undefined);
});

test('resolve indentation === tab', (t) => {
    const config = resolveConfig.resolve({ rules: { indentation: ['tab'] } });

    t.plan(2);
    t.is(config[0].useTabs, true);
    t.is(config[0].tabWidth, 2);
});

test('resolveConfig prettier merge', t =>
    resolveConfig({
        filePath: './fixtures/style.css',
        prettierOptions: getPrettierConfig('./fixtures/style.css')
    }).then((config) => {
        t.is(config[0].semi, false);

        return config;
    }));

test('resolve config with null prettierOptions', t =>
    t.notThrows(() => resolveConfig.resolve({ rules: { indentation: ['tab'] } }, null)));

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

test('format without code but with filePath', t =>
    format({ filePath: './fixtures/style.css' }).then((source) => {
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
    }));

test('format less', (t) => {
    const source = fs.readFileSync('./fixtures/less.less', 'utf8');

    return format({
        text: source,
        filePath: './fixtures/less.less'
    }).then((source) => {
        t.is(
            source,
            `@base: #F938AB;

.box-shadow(@style, @c) when (iscolor(@c)) {
    -webkit-box-shadow: @style @c;
    box-shadow: @style @c;
}
.box-shadow(@style, @alpha: 50%) when (isnumber(@alpha)) {
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

test('format with syntax error from prettier', (t) => {
    const source = fs.readFileSync('./tests/error-syntax.css', 'utf8');

    return format({
        text: source,
        filePath: './tests/error-syntax.css'
    }).catch((err) => {
        t.is(err.name, 'SyntaxError');
    });
});

test('alternate stylelint format', (t) => {
    const source = fs.readFileSync('./fixtures/style.css', 'utf8');

    return linterAPI
        ._lintSource({
            code: source
            // codeFilename: process.cwd()
            // codeFilename: path.resolve(process.cwd(), './tests/less.less')
            // filePath: path.resolve(process.cwd(), './fixtures/style.css')
        })
        .then((result) => {
            const fixed = result.root.toString(result.opts.syntax);

            t.is(
                result.root.toString(result.opts.syntax),
                `@media print {
    a {
        color: #FFF;
        background-position: top left,
        top right;
    }
}




a[id='foo'] { content: 'x'; }
`
            );

            return fixed;
        });
});

