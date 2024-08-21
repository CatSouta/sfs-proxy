// config/config.prod.js

// 代理链接
exports.proxyLink = "http://127.0.0.1:9000/";

// MinIO 配置
exports.minio = {
  endPoint: "127.0.0.1",
  port: 9000,
  useSSL: false,
  accessKey: "ZaSQ3mMR7HGruarZVdIa",
  secretKey: "5GAlV9B9dTHSkLeGSEJZvRH67ra8AWTy8KQmQrHi",
};

// Cluster 配置
exports.cluster = {
  listen: {
    port: 7002,
  },
};
