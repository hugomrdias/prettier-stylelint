'use strict';

const fs = require('fs');
const path = require('path');
const debug = require('debug')('prettier-stylelint:utils');
const ignore = require('ignore');

exports.arrify = function(val) {
    if (val === null || val === undefined) {
        return [];
    }

    return Array.isArray(val) ? val : [val];
};

exports.ignore = function(paths, options) {
    const ignorer = ignore();
    const gitignore = path.resolve(options.cwd, '.gitignore');
    const prettierignore = path.resolve(options.cwd, '.prettierignore');

    try {
        ignorer.add(fs.readFileSync(gitignore, 'utf8').toString());
    } catch (err) {
        debug('.gitignore error', err.message);
    }

    try {
        ignorer.add(fs.readFileSync(prettierignore, 'utf8').toString());
    } catch (err) {
        debug('.prettierignore error', err.message);
    }

    paths = ignorer.filter(paths);

    // Filter out unwanted file extensions
    // For silly users that don't specify an extension in the glob pattern
    if (paths.length > 0) {
        paths = paths.filter((filePath) => {
            const ext = path.extname(filePath).replace('.', '');

            return options.extensions.indexOf(ext) !== -1;
        });
    }

    return paths;
};
