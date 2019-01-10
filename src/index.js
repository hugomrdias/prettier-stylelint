'use strict';

const fs = require('fs');
const path = require('path');
const resolveFrom = require('resolve-from');
const debug = require('debug')('prettier-stylelint:main');

/**
 * Resolve Config for the given file
 *
 * @export
 * @param {string} file - filepath
 * @param {Object} options - options
 * @returns {Promise} -
 */
function resolveConfig({
    filePath,
    stylelintPath,
    stylelintConfig,
    prettierOptions
}) {
    const resolve = resolveConfig.resolve;
    const stylelint = requireRelative(stylelintPath, filePath, 'stylelint');
    const linterAPI = stylelint.createLinter();

    if (stylelintConfig) {
        return Promise.resolve(resolve(stylelintConfig, prettierOptions));
    }

    return linterAPI
        .getConfigForFile(filePath)
        .then(({ config }) => resolve(config, prettierOptions));
}

resolveConfig.resolve = (stylelintConfig, prettierOptions) => {
    const { rules } = stylelintConfig;
    const fromRule = rule => rules[rule][0];
    const implicitOptions = {};

    if (rules['max-line-length']) {
        implicitOptions.printWidth = fromRule('max-line-length');
    }

    if (rules['string-quotes'] && fromRule('string-quotes') === 'single') {
        implicitOptions.singleQuote = true;
    }

    if (rules.indentation) {
        const indentation = fromRule('indentation');

        if (indentation === 'tab') {
            implicitOptions.useTabs = true;
            implicitOptions.tabWidth = 2;
        } else {
            implicitOptions.useTabs = false;
            implicitOptions.tabWidth = indentation;
        }
    }

    implicitOptions.parser = 'postcss';

    const options = Object.assign({}, prettierOptions, implicitOptions);

    debug('prettier %O', options);
    debug('linter %O', stylelintConfig);

    return [options, stylelintConfig];
};

function stylelinter(code, { filePath, stylelintPath }) {
    const stylelint = requireRelative(stylelintPath, filePath, 'stylelint');
    const linterAPI = stylelint.createLinter({ fix: true });

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

function requireRelative(path, filePath, packageName) {
    try {
        if (path) {
            return require(resolveFrom(path, packageName));
        }

        return require(resolveFrom(filePath, packageName));
    } catch (err) {
        return require(packageName);
    }
}

function getPrettierConfig(filePath, prettierPath) {
    const prettier = requireRelative(prettierPath, filePath, 'prettier');

    // NOTE: Backward-compatibility with old prettier versions (<1.7)
    //       that don't have ``resolveConfig.sync` method.
    return typeof prettier.resolveConfig.sync === 'undefined' ?
        {} :
        prettier.resolveConfig.sync(filePath);
}

function format({
    filePath = '',
    text = fs.readFileSync(filePath, 'utf8'),
    prettierPath,
    stylelintPath,
    prettierOptions = getPrettierConfig(filePath, prettierPath),
    stylelintConfig
}) {
    const options = {
        filePath: path.isAbsolute(filePath) ?
            filePath :
            path.resolve(process.cwd(), filePath),
        text,
        prettierPath,
        stylelintPath,
        stylelintConfig,
        prettierOptions
    };
    const prettier = requireRelative(prettierPath, filePath, 'prettier');

    return resolveConfig(options).then(([prettierConfig]) =>
        stylelinter(prettier.format(text, prettierConfig), options)
    );
}

exports.format = format;
exports.resolveConfig = resolveConfig;
exports.getPrettierConfig = getPrettierConfig;
