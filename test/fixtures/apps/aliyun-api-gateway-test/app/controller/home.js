'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    this.ctx.body = this.app.plugins.aliyunApiGatewayFull.name;

  }


}

module.exports = HomeController;
