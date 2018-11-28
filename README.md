# egg-aliyun-api-gateway


<!--
Description here.
-->

## Install

```bash
use npm
$ npm i egg-aliyun-api-gateway-full --save
```

```bash
use yarn
$ yarn add egg-aliyun-api-gateway-full
```

## Usage

```js
// {app_root}/config/plugin.js
exports.aliyunApiGateway = {
  enable: true,
  package: 'egg-aliyun-api-gateway',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.aliyunApiGateway = {
    appKey: 'your appKey',
    appSecret: 'your appSecret',
    stage : 'RELEASE', //default 'RELEASE'
    verbose : true     // default true, true means return result with request and response。
};


```

see [config/config.default.js](config/config.default.js) for more detail.

## Example

<!-- example here -->

## Questions & Suggestions

Please open an issue [here](https://github.com/xiaoemoxiw/egg-aliyun-api-gateway/issues).

## License

[MIT](LICENSE)
