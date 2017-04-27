'use strict';

const util = require('util');
const URL = require('url').URL;
const urlBinding = process.binding('url');

const platform = process.platform;
const isWindows = platform === 'win32';

const searchParamsSymbolName = 'query';

const symbols = Reflect.ownKeys(new URL('about:blank'));
const searchParams = symbols.find(symbol => util.inspect(symbol) === `Symbol(${searchParamsSymbolName})`);

const errCodes = {
  'ERR_INVALID_FILE_URL_PATH': 'File URL path %s',
  'ERR_INVALID_FILE_URL_HOST': 'File URL host %s',
  'ERR_INVALID_URL_SCHEME': 'The URL must be of scheme %s',
  'ERR_MISSING_ARGS': 'The "%s" argument must be specified'
};

function domainToUnicode(domain) {
  if (arguments.length < 1)
    throw Object.assign(new TypeError(util.format(errCodes.ERR_MISSING_ARGS,
    'domain')), {name: 'TypeError [ERR_MISSING_ARGS]', code: 'ERR_MISSING_ARGS'});

  // toUSVString is not needed.
  return urlBinding.domainToUnicode(`${domain}`);
}

function getPathFromURLWin32(url) {
  var hostname = url.hostname;
  var pathname = url.pathname;
  for (var n = 0; n < pathname.length; n++) {
    if (pathname[n] === '%') {
      var third = pathname.codePointAt(n + 2) | 0x20;
      if ((pathname[n + 1] === '2' && third === 102) || // 2f 2F /
          (pathname[n + 1] === '5' && third === 99)) {  // 5c 5C \
        return Object.assign(new TypeError(util.format(errCodes.ERR_INVALID_FILE_URL_PATH,
    'must not include encoded \\ or / characters')), {name: 'TypeError [ERR_INVALID_FILE_URL_PATH]', code: 'ERR_INVALID_FILE_URL_PATH'});
      }
    }
  }
  pathname = decodeURIComponent(pathname);
  if (hostname !== '') {
    // If hostname is set, then we have a UNC path
    // Pass the hostname through domainToUnicode just in case
    // it is an IDN using punycode encoding. We do not need to worry
    // about percent encoding because the URL parser will have
    // already taken care of that for us. Note that this only
    // causes IDNs with an appropriate `xn--` prefix to be decoded.
    return `//${domainToUnicode(hostname)}${pathname}`;
  } else {
    // Otherwise, it's a local path that requires a drive letter
    var letter = pathname.codePointAt(1) | 0x20;
    var sep = pathname[2];
    if (letter < 97 || letter > 122 ||   // a..z A..Z
        (sep !== ':')) {
      return Object.assign(new TypeError(util.format(errCodes.ERR_INVALID_FILE_URL_PATH,
    'must be absolute')), {name: 'TypeError [ERR_INVALID_FILE_URL_PATH]', code: 'ERR_INVALID_FILE_URL_PATH'});
    }
    return pathname.slice(1);
  }
}

function getPathFromURLPosix(url) {
  if (url.hostname !== '') {
    return Object.assign(new TypeError(util.format(errCodes.ERR_INVALID_FILE_URL_HOST,
    `must be "localhost" or empty on ${platform}`)), {name: 'TypeError [ERR_INVALID_FILE_URL_HOST]', code: 'ERR_INVALID_FILE_URL_HOST'});
  }
  var pathname = url.pathname;
  for (var n = 0; n < pathname.length; n++) {
    if (pathname[n] === '%') {
      var third = pathname.codePointAt(n + 2) | 0x20;
      if (pathname[n + 1] === '2' && third === 102) {
        return Object.assign(new TypeError(util.format(errCodes.ERR_INVALID_FILE_URL_PATH,
        'must not include encoded / characters')), {name: 'TypeError [ERR_INVALID_FILE_URL_PATH]', code: 'ERR_INVALID_FILE_URL_PATH'});
      }
    }
  }
  return decodeURIComponent(pathname);
}

function getPathFromURL(path) {
  if (path == null || !path[searchParams] ||
      !path[searchParams][searchParams]) {
    return path;
  }
  if (path.protocol !== 'file:')
    return Object.assign(new TypeError(util.format(errCodes.ERR_INVALID_URL_SCHEME,
    `file`)), {name: 'TypeError [ERR_INVALID_URL_SCHEME]', code: 'ERR_INVALID_URL_SCHEME'});
  return isWindows ? getPathFromURLWin32(path) : getPathFromURLPosix(path);
}

exports.getPathFromURL = getPathFromURL;
