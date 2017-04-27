'use strict';

const Buffer = require('buffer').Buffer;
const constants = process.binding('constants').fs;

const O_APPEND = constants.O_APPEND | 0;
const O_CREAT = constants.O_CREAT | 0;
const O_EXCL = constants.O_EXCL | 0;
const O_RDONLY = constants.O_RDONLY | 0;
const O_RDWR = constants.O_RDWR | 0;
const O_SYNC = constants.O_SYNC | 0;
const O_TRUNC = constants.O_TRUNC | 0;
const O_WRONLY = constants.O_WRONLY | 0;

function assertEncoding(encoding) {
  if (encoding && !Buffer.isEncoding(encoding)) {
    throw new Error(`Unknown encoding: ${encoding}`);
  }
}

function stringToFlags(flag) {
  if (typeof flag === 'number') {
    return flag;
  }

  switch (flag) {
    case 'r' : return O_RDONLY;
    case 'rs' : // Fall through.
    case 'sr' : return O_RDONLY | O_SYNC;
    case 'r+' : return O_RDWR;
    case 'rs+' : // Fall through.
    case 'sr+' : return O_RDWR | O_SYNC;

    case 'w' : return O_TRUNC | O_CREAT | O_WRONLY;
    case 'wx' : // Fall through.
    case 'xw' : return O_TRUNC | O_CREAT | O_WRONLY | O_EXCL;

    case 'w+' : return O_TRUNC | O_CREAT | O_RDWR;
    case 'wx+': // Fall through.
    case 'xw+': return O_TRUNC | O_CREAT | O_RDWR | O_EXCL;

    case 'a' : return O_APPEND | O_CREAT | O_WRONLY;
    case 'ax' : // Fall through.
    case 'xa' : return O_APPEND | O_CREAT | O_WRONLY | O_EXCL;

    case 'a+' : return O_APPEND | O_CREAT | O_RDWR;
    case 'ax+': // Fall through.
    case 'xa+': return O_APPEND | O_CREAT | O_RDWR | O_EXCL;
  }

  throw new Error('Unknown file open flag: ' + flag);
}

module.exports = {
  assertEncoding,
  stringToFlags,
  realpathCacheKey: Symbol('realpathCacheKey')
};
