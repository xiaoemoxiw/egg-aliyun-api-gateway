/** @Author : YuXueWen
 * @File : request.js
 * @Email : 8586826@qq.com
 **/

'use strict';

const assert = require('assert');
const Client = require('./aliyun-api-gateway/client');

function checkBucketConfig(config) {
  assert(config.appKey || config.appSecret,
    '[egg-aliyun-api-gateway] Must set `appKey` and `appSecret` in aliyunApiGateway\'s config');
}

module.exports = app => {
  app.addSingleton('aliyunApiGateway', config => {

    const { appKey, appSecret, stage, verbose } = config || {};
    const option = [];
    if (stage) {
      option.push(stage);
    }

    if (typeof verbose === 'boolean') {
      option.push(verbose);
    }

    checkBucketConfig(config);

    return new Client(appKey, appSecret, ...option);
  });


};
