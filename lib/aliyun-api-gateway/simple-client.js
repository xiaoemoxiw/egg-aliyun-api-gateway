'use strict';

const format = require('url').format;
const httpx = require('httpx');

const ua = require('./ua');
const Base = require('./base');

/**
 * API Gateway Simple client that use appcode
 */
class SimpleClient extends Base {
  constructor(appcode) {
    super();
    this.appcode = appcode;
  }

  async request(method, url, opts) {
    const options = {
      method,
      headers: {
        authorization: 'APPCODE ' + this.appcode,
        'user-agent': ua,
      },
      data: opts.data,
      beforeRequest(opts) {
        // FIXME: 证书有问题
        opts.rejectUnauthorized = false;
        return opts;
      },
      timeout: opts.timeout,
    };

    const response = await httpx.request(url, options);

    const headers = response.headers;
    const code = response.statusCode;
    if (code !== 200) {
      const err = new Error(`${method} '${format(url)}' failed width code(${code}).` +
        ` request id: ${headers['x-ca-request-id']},` +
        ` error message: ${headers['x-ca-error-message']}`);
      err.code = code;
      err.data = {
        headers: response.headers,
      };
      throw err;
    }

    let result = await httpx.read(response, 'utf8');
    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('application/json')) {
      try {
        result = JSON.parse(result);
      } catch (ex) {
        ex.message = `${method} ${format(url)} failed. ` + ex.message;
        ex.data = result;
        throw ex;
      }
    }
    return result;
  }
}

module.exports = SimpleClient;
