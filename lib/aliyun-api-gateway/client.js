'use strict';

const { parse } = require('url');
const crypto = require('crypto');

const uuid = require('uuid');
const httpx = require('httpx');

const ua = require('./ua');
const Base = require('./base');

const form = 'application/x-www-form-urlencoded';
const hasOwnProperty = function(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

/**
 * API Gateway Client
 */
class Client extends Base {
  constructor(key, secret, stage = 'RELEASE', verbose = true) {
    super();
    this.appKey = key;
    this.appSecret = Buffer.from(secret, 'utf8');
    this.stage = stage;
    this.verbose = verbose === true;
  }

  buildStringToSign(method, headers, signedHeadersStr, url, data) {
    // accept, contentMD5, contentType,
    const lf = '\n';
    const list = [ method, lf ];

    const accept = headers.accept;
    if (accept) {
      list.push(accept);
    }
    list.push(lf);

    const contentMD5 = headers['content-md5'];
    if (contentMD5) {
      list.push(contentMD5);
    }
    list.push(lf);

    const contentType = headers['content-type'] || '';
    if (contentType) {
      list.push(contentType);
    }
    list.push(lf);

    const date = headers.date;
    if (date) {
      list.push(date);
    }
    list.push(lf);

    if (signedHeadersStr) {
      list.push(signedHeadersStr);
      list.push(lf);
    }

    if (contentType.startsWith(form)) {
      list.push(this.buildUrl(url, data));
    } else {
      list.push(this.buildUrl(url));
    }

    return list.join('');
  }

  sign(stringToSign) {
    return crypto.createHmac('sha256', this.appSecret)
      .update(stringToSign, 'utf8').digest('base64');
  }

  md5(content) {
    return crypto.createHash('md5')
      .update(content, 'utf8')
      .digest('base64');
  }

  getSignHeaderKeys(headers, signHeaders) {
    const keys = Object.keys(headers).sort();
    const signKeys = [];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      // x-ca- 开头的header或者指定的header
      if (key.startsWith('x-ca-') || hasOwnProperty(signHeaders, key)) {
        signKeys.push(key);
      }
    }

    // 按字典序排序
    return signKeys.sort();
  }

  buildUrl(parsedUrl, data) {
    const toStringify = Object.assign(parsedUrl.query, data);
    let result = parsedUrl.pathname;
    if (Object.keys(toStringify).length) {
      const keys = Object.keys(toStringify).sort();
      const list = new Array(keys.length);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (toStringify[key] !== undefined && toStringify[key] !== null && ('' + toStringify[key])) {
          list[i] = `${key}=${toStringify[key]}`;
        } else {
          list[i] = `${key}`;
        }
      }
      result += '?' + list.join('&');
    }
    return result;
  }

  buildHeaders(headers = {}, signHeaders) {
    return Object.assign({
      'x-ca-timestamp': Date.now(),
      'x-ca-key': this.appKey,
      'x-ca-nonce': uuid.v4(),
      'x-ca-stage': this.stage,
      accept: 'application/json',
    }, headers, signHeaders);
  }

  getSignedHeadersString(signHeaders, headers) {
    const list = [];
    for (let i = 0; i < signHeaders.length; i++) {
      const key = signHeaders[i];
      list.push(key + ':' + headers[key]);
    }

    return list.join('\n');
  }

  async request(method, url, opts, originData) {
    const signHeaders = opts.signHeaders;
    // 小写化，合并之后的headers
    const headers = this.buildHeaders(opts.headers, signHeaders);

    const requestContentType = headers['content-type'] || '';
    if (method === 'POST' && !requestContentType.startsWith(form)) {
      headers['content-md5'] = this.md5(opts.data);
    }

    const signHeaderKeys = this.getSignHeaderKeys(headers, signHeaders);
    headers['x-ca-signature-headers'] = signHeaderKeys.join(',');
    const signedHeadersStr = this.getSignedHeadersString(signHeaderKeys, headers);

    const parsedUrl = parse(url, true);
    const stringToSign = this.buildStringToSign(method, headers, signedHeadersStr, parsedUrl, originData);
    headers['x-ca-signature'] = this.sign(stringToSign);
    headers['user-agent'] = ua;

    const entry = {
      url,
      request: null,
      response: null,
    };

    const result = await httpx.request(url, {
      method,
      headers,
      data: opts.data,
      beforeRequest(opts) {
        // FIXME: 证书有问题
        opts.rejectUnauthorized = false;
        return opts;
      },
      timeout: opts.timeout,
    }
    ).then(response => {
      entry.request = {
        headers: response.req._headers,
      };
      entry.response = {
        statusCode: response.statusCode,
        headers: response.headers,
      };

      return httpx.read(response);
    }).then(buffer => {

      let json = {};
      if (buffer.length > 0) {
        try {
          json = JSON.parse(buffer);

        } catch (e) {
          json = buffer.toString('utf8');
        }

      }

      if (this.verbose) {
        return [ json, entry ];
      }

      return json;
    });


    return result;


  }
}

module.exports = Client;
