# prettier-stylelint [![NPM Version](https://img.shields.io/npm/v/prettier-stylelint.svg)](https://www.npmjs.com/package/prettier-stylelint) [![NPM Downloads](https://img.shields.io/npm/dt/prettier-stylelint.svg)](https://www.npmjs.com/package/prettier-stylelint) [![NPM License](https://img.shields.io/npm/l/prettier-stylelint.svg)](https://www.npmjs.com/package/prettier-stylelint) 
> Format your styles with ease

code > prettier > stylelint > formatted code   
prettier-eslint for stylelint :)   
**THIS IS STILL BETA DON'T USE THIS IN ANY IMPORTANT CODE**   
**IF YOU DO GIT COMMIT FIRST ^^**


## Install

```bash
yarn add prettier-stylelint -D
npm install prettier-stylelint --save-dev
```

## Usage


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
  --quiet -q        Only log std.err

Examples
  $ prettier-stylelint
  $ prettier-stylelint index.js
  $ prettier-stylelint *.js !foo.js
  $ echo 'a[id="foo"] { content: "x"; }' | prettier-stylelint --stdin
  $ echo 'a[id="foo"] { content: "x"; }' | prettier-stylelint -

Default pattern when no arguments:
  **/*.{css,scss,less,sss}
```

## Related

- [prettier-vscode](https://github.com/esbenp/prettier-vscode) - prettier vscode extension
- [prettier-eslint](https://github.com/prettier/prettier-eslint) - the inspiration for this package
- [stylelint](https://github.com/stylelint/stylelint) - the linter ^^

## License

MIT © [Hugo Dias](https://hugodias.me)
