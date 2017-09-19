'use strict';

const path = require('path');
const prettier = require('prettier');
const stylelint = require('stylelint');
// const cosmiconfig = require('cosmiconfig');
const debug = require('debug')('prettier-stylelint:main');

// const explorer = cosmiconfig('stylelint');
const linterAPI = stylelint.createLinter({ fix: true });

/**
 * Resolve Config for the given file
 *
 * @export
 * @param {string} file - filepath
 * @param {Object} options - options
 * @returns {Promise} -
 */
function resolveConfig(file, options = {}) {
    const resolve = resolveConfig.resolve;

    if (options.stylelintConfig) {
        return Promise.resolve(resolve(options.stylelintConfig));
    }

    return linterAPI
        .getConfigForFile(file)
        .then(({ config }) => resolve(config));

    // return explorer.load(file).then(({ config }) => resolve(config));
}

resolveConfig.resolve = (stylelintConfig) => {
    const prettierConfig = {};
    const { rules } = stylelintConfig;

    if (rules['max-line-length']) {
        const printWidth = rules['max-line-length'][0];

        prettierConfig.printWidth = printWidth;
    }

    if (rules['string-quotes']) {
        const quotes = rules['string-quotes'][0];

        if (quotes === 'single') {
            prettierConfig.singleQuote = true;
        }
    }

    if (rules.indentation) {
        const indentation = rules.indentation[0];

        if (indentation === 'tab') {
            prettierConfig.useTabs = true;
            prettierConfig.tabWidth = 2;
        } else {
            prettierConfig.useTabs = false;
            prettierConfig.tabWidth = indentation;
        }
    }
    prettierConfig.parser = 'postcss';
    debug('prettier %O', prettierConfig);
    debug('linter %O', stylelintConfig);

    return [prettierConfig, stylelintConfig];
};

function stylelinter(code, filePath) {
    return linterAPI
        ._lintSource({
            code,
            codeFilename: filePath
        })
        .then((result) => {
            const fixed = result.root.toString(result.opts.syntax);

            return fixed;
        });
}

function format(options) {
    const { filePath = '', text } = options;

    return resolveConfig(filePath, options).then(([prettierConfig]) =>
        stylelinter(
            prettier.format(text, prettierConfig),
            path.isAbsolute(filePath) ?
                filePath :
                path.resolve(process.cwd(), filePath)
        )
    );
}

exports.format = format;
exports.resolveConfig = resolveConfig;
