#!/usr/bin/env node
/* eslint-disable import/no-unassigned-import,import/unambiguous */

require = require('@std/esm')(module);
module.exports = require('./src/cli.js');
