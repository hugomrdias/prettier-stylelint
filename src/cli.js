import fs from 'fs';
import path from 'path';
import meow from 'meow';
import globby from 'globby';
import getStdin from 'get-stdin';
import { format } from './index';

const cli = meow(
    `
Usage
  $ prettier-stylelint [<file|glob> ...]
Options
  --ignore          Additional paths to ignore  [Can be set multiple times]
  --extension       Additional extension to lint [Can be set multiple times]
  --cwd=<dir>       Working directory for files
  --stdin           Validate/fix code from stdin
Examples
  $ prettier-stylelint
  $ prettier-stylelint index.js
  $ prettier-stylelint *.js !foo.js
  $ prettier-stylelint --space
  $ echo 'const x=true' | prettier-stylelint --stdin --fix
Tips
  Put options in package.json instead of using flags so other tools can read it.
`,
    {
        string: ['_'],
        boolean: ['stdin'],
        default: {
            // -semicolon: true,
            esnext: true
        },
        alias: { 'stdin-filename': 'filename' }
    }
);
let input = cli.input;
const opts = cli.flags;

const DEFAULT_EXTENSION = ['css', 'scss'];
const DEFAULT_PATTERN = `**/*.{${DEFAULT_EXTENSION.join(',')}}`;
const DEFAULT_IGNORE = [
    '**/node_modules/**',
    '**/bower_components/**',
    'flow-typed/**',
    'coverage/**',
    '{tmp,temp}/**',
    '**/*.min.js',
    '**/bundle.js',
    'fixture{-*,}.{js,jsx}',
    'fixture{s,}/**',
    '{test,tests,spec,__tests__}/fixture{s,}/**',
    'vendor/**',
    'dist/**'
];

if (input[0] === '-') {
    opts.stdin = true;
    input.shift();
}
if (opts.stdin) {
    getStdin()
        .then(str =>
            format({
                filepath: process.cwd(),
                text: str
            }).then(source => process.stdout.write(source))
        )
        .catch((err) => {
            console.error(err.stack || err);
            process.exitCode = 1;
        });
} else {
    const isEmptyPatterns = input.length === 0;

    input = isEmptyPatterns ? [DEFAULT_PATTERN] : input;

    globby(input, {
        ignore: DEFAULT_IGNORE,
        nodir: true,
        cwd: process.cwd()
    })
        .then((paths) => {
            // Filter out unwanted file extensions
            // For silly users that don't specify an extension in the glob pattern
            if (!isEmptyPatterns) {
                paths = paths.filter((filePath) => {
                    const ext = path.extname(filePath).replace('.', '');

                    return DEFAULT_EXTENSION.indexOf(ext) !== -1;
                });
            }

            return Promise.all(
                paths.map(path =>
                    format({
                        text: fs.readFileSync(path, 'utf8'),
                        filePath: process.cwd()
                    }).then((formatted) => {
                        console.log(path + ' \n');
                        console.log(formatted);

                        return formatted;
                    })
                )
            );
        })
        .catch((err) => {
            console.error(err.stack || err);
            process.exitCode = 1;
        });
}
