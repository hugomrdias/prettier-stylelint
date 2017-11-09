'use strict';

const fs = require('fs');
const path = require('path');
const debug = require('debug')('prettier-stylelint:utils');
const ignore = require('ignore');

exports.arrify = function (val) {
    if (val === null || val === undefined) {
        return [];
    }

    return Array.isArray(val) ? val : [val];
};

exports.ignore = function (paths, options) {
    const ignorer = ignore();
    const files = {
        gitignore: path.resolve(options.cwd, '.gitignore'),
        prettierignore: path.resolve(options.cwd, '.prettierignore'),
        stylelintignore: path.resolve(options.cwd, '.stylelintignore')
    };

    for (const key in files) {
        if (!files.hasOwnProperty(key)) return;

        try {
            ignorer.add(fs.readFileSync(files[key], 'utf8').toString());
        } catch (err) {
            debug(`.${key} error`, err.message);
        }
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
