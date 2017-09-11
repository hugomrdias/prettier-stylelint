import test from 'ava';
import { resolveConfig, formatFile } from './index';

test.only('test resolveConfig', (t) => {
    const config = resolveConfig('./fixtures/style.css');

    t.deepEqual(config, {
        rules: {
            'string-quotes': 'single',
            'indentation': ['tab', { except: ['value'] }],
            'block-no-empty': null,
            'color-no-invalid-hex': true,
            'comment-empty-line-before': [
                'always',
                { ignore: ['stylelint-commands', 'after-comment'] }
            ],
            'declaration-colon-space-after': 'always',
            'max-empty-lines': 2,
            'rule-empty-line-before': [
                'always',
                {
                    except: ['first-nested'],
                    ignore: ['after-comment']
                }
            ],
            'unit-whitelist': ['em', 'rem', '%', 's']
        }
    });
});

test('test formatFile', t =>
    formatFile('./fixtures/style.css').then((source) => {
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
