'use strict';

const mock = require('egg-mock');

describe('test/aliyun-api-gateway.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/aliyun-api-gateway-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('aliyunApiGatewayFull')
      .expect(200);
  });
});
