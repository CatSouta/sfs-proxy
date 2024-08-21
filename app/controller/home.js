// app/controller/home.js

const { Controller } = require("egg");

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = "OK";
  }
}

module.exports = HomeController;
