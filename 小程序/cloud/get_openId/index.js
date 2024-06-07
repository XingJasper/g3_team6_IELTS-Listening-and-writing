// 云函数入口文件
const cloud = require('wx-server-sdk');

// 使用当前云环境初始化云开发
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext();

    return {
      event,
      openid: wxContext.OPENID,
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID,
    };
  } catch (error) {
    console.error('云函数执行错误', error);
    return {
      error: error.message
    };
  }
};