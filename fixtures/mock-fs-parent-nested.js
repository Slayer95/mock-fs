'use strict';

const fs = require('fs');
const path = require('path');
const Module = require('module');

const mock = require('./..');

const fsSandbox = {
	'mock-fs-child-nested.js': fs.readFileSync(path.resolve(__dirname, 'mock-fs-child-nested.js')),
};

mock(fsSandbox);

global.fs = fs;
global.path = path;

require('./mock-fs-child-nested');
