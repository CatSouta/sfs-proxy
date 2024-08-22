// app/controller/proxy.js

const { Controller } = require("egg");
const os = require("os");
const sharp = require("sharp");
const Minio = require("minio");

class ProxyController extends Controller {
  async index() {
    const { ctx } = this;
    let uri = ctx.params[0]; // 传入 URI
    let finalUri, imageParams;
    if (this.isImagePath(uri.split("@")[0], 0)) {
      finalUri = uri.split("@")[0];
      imageParams = uri.split("@")[1];
    } else {
      finalUri = uri;
    }
    const result = await ctx.curl(ctx.app.config.proxyLink + finalUri);
    // 检测储存内是否存在该文件
    if (result.status !== 200) {
      // 返回 XML 报错
      ctx.status = result.status;
      ctx.set("content-type", result.headers["content-type"]);
      ctx.body = result.data
        .toString()
        .replace(/<BucketName>(.*?)<\/BucketName>/g, "")
        .replace(/<Key>(.*?)<\/Key>/g, "")
        .replace(
          /<HostId>(.*?)<\/HostId>/g,
          `<HostId>${os.hostname()}</HostId>`
        ); // 去除 BucketName, Key 并修改 HostId 为代理机器 Hostname
      return;
    }

    // 检测该文件是否为图片且有参数需要处理
    if (result.headers["content-type"].startsWith("image/") && imageParams) {
      const check = await ctx.curl(ctx.app.config.proxyLink + uri);
      if (check.status === 404) {
        // 获取宽高参数
        const widthMatch = imageParams.match(/(\d+)w/);
        const heightMatch = imageParams.match(/(\d+)h/);
        const width = widthMatch ? parseInt(widthMatch[1], 10) : null;
        const height = heightMatch ? parseInt(heightMatch[1], 10) : null;

        // 宽高处理
        let data = sharp(result.data);
        if (width || height) {
          data = data.resize(width, height);
        }

        // 获取格式参数
        const format = imageParams.split(".")[1];
        // 检测需转换的是否为图片格式
        if (!this.isImagePath(format, 1)) {
          ctx.body = {
            code: 400,
            message: "Incorrect conversion format",
          };
          return;
        }

        // 格式处理
        data = data.toFormat(format);

        // 获取处理后的图片缓冲区
        const buffer = await data.toBuffer();

        // 储存图片至对象储存，避免下次请求重新处理
        const bucketName = uri.split("/")[0];
        const contentType = `image/${format}`;
        await this.saveFile(
          bucketName,
          uri.replace(`${bucketName}/`, ""),
          buffer,
          contentType
        );

        // 返回数据
        ctx.set("content-type", contentType);
        ctx.body = buffer;
        return;
      }
      ctx.set("content-type", check.headers["content-type"]);
      ctx.body = check.data;
      return;
    }

    // 无参数处理正常展示
    ctx.set("content-type", result.headers["content-type"]);
    ctx.body = result.data;
  }

  /**
   * 检测路径是否为图片
   * @param {string} filePath
   * @returns
   */
  isImagePath(filePath, type) {
    const imageExtensions = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "avif",
      "bmp",
      "tiff",
    ];
    if (type === 0) {
      imageExtensions.push("svg");
    }
    const extension = filePath.split(".").pop().toLowerCase();
    return imageExtensions.includes(extension);
  }

  async saveFile(bucket, dest, file, contentType) {
    const { ctx } = this;
    const minioClient = new Minio.Client(ctx.app.config.minio);
    await minioClient.putObject(bucket, dest, file, {
      "content-type": contentType,
    });
  }
}

module.exports = ProxyController;
