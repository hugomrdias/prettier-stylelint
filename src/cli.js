#!/usr/bin/env node
/* eslint-disable import/unambiguous */
'use strict';

const fs = require('fs');
const updateNotifier = require('update-notifier');
const meow = require('meow');
const globby = require('globby');
const getStdin = require('get-stdin');
const pify = require('pify');
const { arrify, ignore } = require('./utils');
const { format } = require('./index');

const cli = meow(
    `
Usage
  $ prettier-stylelint [<file|glob> ...]

Options
  --ignore          Additional paths to ignore  [Can be set multiple times]
  --extension       Additional extension to lint [Can be set multiple times]
  --cwd=<dir>       Working directory for files
  --stdin           Validate/fix code from stdin ('prettier-stylelint -' also works)
  --write           Edit files in place (DRAGONS AHEAD !!)
  --quiet -q        Only log std.err

Examples
  $ prettier-stylelint
  $ prettier-stylelint index.js
  $ prettier-stylelint *.js !foo.js
  $ echo 'a[id="foo"] { content: "x"; }' | prettier-stylelint --stdin

Default pattern when no arguments:
  **/*.{css,scss,less,sss}
`,
    {
        string: ['_', 'ignore', 'extension', 'cwd'],
        boolean: ['stdin', 'write'],
        default: {
            cwd: process.cwd(),
            write: false,
            quiet: false
        },
        alias: { q: 'quiet' }
    }
);

updateNotifier({ pkg: cli.pkg }).notify();

let input = cli.input;
const opts = cli.flags;
const DEFAULT_EXTENSION = ['css', 'scss', 'less', 'sss'];
const DEFAULT_PATTERN = `**/*.{${DEFAULT_EXTENSION.join(',')}}`;
const DEFAULT_IGNORE = [
    '**/node_modules/**',
    '**/bower_components/**',
    'flow-typed/**',
    'coverage/**',
    '{tmp,temp}/**',
    '**/*.min.{css,scss,less,sss}',
    '**/bundle.{css,scss,less,sss}',
    'fixture{-*,}.{css,scss,less,sss}',
    'fixture{s,}/**',
    '{test,tests,spec,__tests__}/fixture{s,}/**',
    'vendor/**',
    'dist/**'
];

const options = {
    ignore: DEFAULT_IGNORE.concat(arrify(opts.ignore)),
    extensions: DEFAULT_EXTENSION.concat(arrify(opts.extension)),
    cwd: opts.cwd,
    write: opts.write,
    quiet: opts.quiet
};

if (input[0] === '-') {
    opts.stdin = true;
    input.shift();
}
if (opts.stdin) {
    getStdin()
        .then(str =>
            format({
                filepath: opts.cwd,
                text: str
            }).then(source => process.stdout.write(source))
        )
        .catch((err) => {
            console.error(err.stack || err);
            process.exitCode = 1;
        });
} else {
    const isEmptyPatterns = input.length === 0;

    input = isEmptyPatterns ? [DEFAULT_PATTERN] : arrify(input);

    globby(input, {
        ignore: options.ignore,
        nodir: true,
        cwd: options.cwd
    })
        .then((paths) => {
            paths = ignore(paths, options);

            return Promise.all(
                paths.map(path =>
                    format({
                        text: fs.readFileSync(path, 'utf8'),
                        filePath: path,
                        quiet: options.quiet
                    })
                        .then((formatted) => {
                            if (!options.quiet) {
                                console.log(formatted);
                            }
                            if (options.write) {
                                return pify(fs.writeFile)(path, formatted);
                            }

                            return formatted;
                        })
                        .catch((err) => {
                            console.error(
                                `prettier-stylelint [ERROR]: There was an error formatting "${path}"\n`
                            );
                            console.error(err.stack || err);
                            console.error('\n');
                            process.exitCode = 1;
                        })
                )
            );
        })
        .catch((err) => {
            console.error(err.stack || err);
            process.exitCode = 1;
        });
}
