/* eslint valid-jsdoc: "off" */
const path = require('path');
const fs = require('fs');

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // 中间件配置
  config.middleware = ['errorHandler'];

  // 安全设置
  config.security = {
    csrf: {
      enable: false // 关闭 csrf 检测
    }
  };

  // Favicon 设置
  config.siteFile = {
    '/favicon.ico': fs.readFileSync(path.join(__dirname, '../app/public/favicon.ico'))
  };

  return {
    ...config
  };
};
