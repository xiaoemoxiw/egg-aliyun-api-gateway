'use strict';

const assert = require('assert');
const Client = require('./lib/aliyun-api-gateway/client');

module.exports = app => {

  const { appKey, appSecret, stage, verbose } = app.config.aliyunApiGateway || {};

  // check key & secret
  assert(appKey && appSecret,
    '[egg-aliyun-api-geteway] Must set `appKey` and `appSecret` in aliyun-api-geteway\'s config');

  app.coreLogger.info('[egg-egg-aliyun-api-geteway] setup');

  const option = [];
  if (stage) {
    option.push(stage);
  }

  if (typeof verbose === 'boolean') {
    option.push(verbose);
  }

  app.aliyunApiGateway = new Client(appKey, appSecret, ...option);

};
