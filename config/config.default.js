/* eslint valid-jsdoc: "off" */

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = (appInfo) => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // 中间件配置
  config.middleware = ["errorHandler"];

  // 安全设置
  config.security = {
    csrf: {
      enable: false, // 关闭 csrf 检测
    },
  };

  return {
    ...config,
  };
};
