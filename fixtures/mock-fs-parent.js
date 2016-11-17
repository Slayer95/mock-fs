'use strict';

const fs = require('fs');
const path = require('path');
const Module = require('module');

const mock = require('./..');

const fsSandbox = {
	'mock-fs-child.js': fs.readFileSync(path.resolve(__dirname, 'mock-fs-child.js')),
};

mock(fsSandbox);
require('./mock-fs-child');
