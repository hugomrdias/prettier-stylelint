# prettier-stylelint [![NPM Version](https://img.shields.io/npm/v/prettier-stylelint.svg)](https://www.npmjs.com/package/prettier-stylelint) [![NPM Downloads](https://img.shields.io/npm/dt/prettier-stylelint.svg)](https://www.npmjs.com/package/prettier-stylelint) [![NPM License](https://img.shields.io/npm/l/prettier-stylelint.svg)](https://www.npmjs.com/package/prettier-stylelint) 
> Format your styles with ease

code > prettier > stylelint > formatted code   
prettier-eslint for stylelint :)   
**THIS IS STILL BETA DON'T USE THIS IN ANY IMPORTANT CODE**   
**IF YOU DO GIT COMMIT FIRST ^^**


## Install

```
$ yarn add prettier-stylelint --dev
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

## Related

- [prettier-vscode](https://github.com/esbenp/prettier-vscode) - prettier vscode extension
- [prettier-eslint](https://github.com/prettier/prettier-eslint) - the inspiration for this package
- [stylelint](https://github.com/stylelint/stylelint) - the linter ^^

## License

MIT © [Hugo Dias](http://hugodias.me)
