#!/usr/bin/env node
'use strict';

const debug = require('debug')('prettier-stylelint');
const importLocal = require('import-local');

// Prefer the local installation of prettier-stylelint
if (importLocal(__filename)) {
    debug('Using local install of prettier-stylelint cli');
} else {
    try {
        require('./src/cli');
    } catch (err) {
        console.error(`\n  ${err.message}`);
        process.exit(1);
    }
}
