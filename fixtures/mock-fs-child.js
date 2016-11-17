'use strict';

const fs = require('fs');
const path = require('path');

fs.accessSync(path.resolve(__dirname, 'mock-fs-parent.js'));
