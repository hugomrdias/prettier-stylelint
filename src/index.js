import fs from 'fs';
import path from 'path';
import cosmiconfig from 'cosmiconfig';
import prettier from 'prettier';
import stylelint from 'stylelint';
import tempWrite from 'temp-write';

const explorer = cosmiconfig('stylelint');
const prettierDefaultConfig = {
    printWidth: 80,
    tabWidth: 2,
    singleQuote: false,
    trailingComma: 'none',
    bracketSpacing: true,
    semi: true,
    useTabs: false,
    parser: 'postcss',
    jsxBracketSameLine: false
};

/**
 * Resolve Config for the given file
 *
 * @export
 * @param {string} file - filepath
 * @param {Object} stylelintConfig - stylelint config
 * @returns {Promise} -
 */
export function resolveConfig(file, stylelintConfig) {
    function resolve(config) {
        const prettier = {};
        const { rules } = config;

        if (rules['string-quotes'] && rules['string-quotes'] === 'single') {
            prettier.singleQuote = true;
        }

        if (rules.indentation) {
            const indentation = Array.isArray(rules.indentation) ?
                rules.indentation[0] :
                rules.indentation;

            if (indentation === 'tab') {
                prettier.useTabs = true;
                prettier.tabWidth = 2;
            } else {
                prettier.useTabs = false;
                prettier.tabWidth = indentation;
            }
        }

        return [Object.assign({}, prettierDefaultConfig, prettier), config];
    }

    if (file) {
        return explorer.load(file).then(({ config }) => resolve(config));
    }

    return Promise.resolve(resolve(stylelintConfig));
}

function stylelinter(originalPath, filepath, config) {
    return stylelint
        .lint({
            files: filepath,
            config: config,
            fix: true,
            formatter: 'string'
        })
        .then(({ errored, output }) => {
            if (errored) {
                console.error(
                    'Stylelint errors: ' +
                        path.relative(process.cwd(), originalPath),
                    output
                );
            }
            const source = fs.readFileSync(filepath, 'utf8');

            return source;
        });
}

export function format(options) {
    const { filePath, text, stylelintConfig } = options;

    if (!filePath && !stylelintConfig) {
        throw new Error('Either provide file path or stylelint config!');
    }

    return resolveConfig(
        filePath,
        stylelintConfig
    ).then(([prettierConfig, stylelintConfig]) => {
        const tempPath = tempWrite.sync(prettier.format(text, prettierConfig));

        return stylelinter(filePath, tempPath, stylelintConfig);
    });
}
