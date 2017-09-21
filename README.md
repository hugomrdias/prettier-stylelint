# prettier-stylelint [![NPM Version](https://img.shields.io/npm/v/prettier-stylelint.svg)](https://www.npmjs.com/package/prettier-stylelint) [![NPM Downloads](https://img.shields.io/npm/dt/prettier-stylelint.svg)](https://www.npmjs.com/package/prettier-stylelint) [![NPM License](https://img.shields.io/npm/l/prettier-stylelint.svg)](https://www.npmjs.com/package/prettier-stylelint) [![Build Status](https://travis-ci.org/hugomrdias/prettier-stylelint.svg?branch=master)](https://travis-ci.org/hugomrdias/prettier-stylelint) [![codecov](https://codecov.io/gh/hugomrdias/prettier-stylelint/branch/master/graph/badge.svg)](https://codecov.io/gh/hugomrdias/prettier-stylelint)
> Format your styles with ease!

code > prettier > stylelint > formatted code   

prettier-stylelint attempts to create a prettier config based on the stylelint config, then format with prettier followed by stylelint --fix. So after that you should end up with formatted code with no linting errors.

## Install

```bash
yarn add prettier-stylelint -D
npm install prettier-stylelint --save-dev
```

## Usage
This package has a stylelint config to disable some rules that conflict with prettier.


```json
"stylelint": {
    "extends": [
        "stylelint-config-idiomatic-order",
        "./node_modules/prettier-stylelint/config.js"
    ],
    "rules": {
        "indentation": 4,
        "string-quotes": "single"
    }
}

```

After adding the disabling config you can just `prettier-stylelint --write` and its done. Check the CLI options below for more information.   
Also in a near future we should have support for prettier-stylelint in `prettier-vscode` follow this [PR](https://github.com/prettier/prettier-vscode/pull/218).


### API
```js
const format = require('prettier-eslint')
const sourceCode = 'a[id="foo"] { content: "x"; }'
const options = {
  text: sourceCode
}
const formatted = format(options)


// formatted 
a[id='foo'] {
    content: 'x';
}
```   

### CLI Options

The cli automatically ignores `.gitignore` and `.prettierignore`.

>**NOTE:** It is recommended that you keep your files under source control and committed
> before running `prettier-stylelint --write` as it will overwrite your files!


```
Usage
  $ prettier-stylelint [<file|glob> ...]

Options
  --ignore          Additional paths to ignore  [Can be set multiple times]
  --extension       Additional extension to lint [Can be set multiple times]
  --cwd=<dir>       Working directory for files
  --stdin           Validate/fix code from stdin ('prettier-stylelint -' also works)
  --write           Edit files in place (DRAGONS AHEAD !!)
  --quiet -q        Only log stderr

Examples
  $ prettier-stylelint
  $ prettier-stylelint index.js
  $ prettier-stylelint *.js !foo.js
  $ echo 'a[id="foo"] { content: "x"; }' | prettier-stylelint --stdin

Default pattern when no arguments:
  **/*.{css,scss,less,sss}
```

## Related

- [prettier-vscode](https://github.com/esbenp/prettier-vscode) - prettier vscode extension
- [prettier-eslint](https://github.com/prettier/prettier-eslint) - the inspiration for this package
- [stylelint](https://github.com/stylelint/stylelint) - the linter ^^

## License

MIT © [Hugo Dias](https://hugodias.me)
