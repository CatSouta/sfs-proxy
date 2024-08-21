// app/controller/notfound.js

const { Controller } = require("egg");

class NotfoundController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: "Not Found",
    };
  }
}

module.exports = NotfoundController;
