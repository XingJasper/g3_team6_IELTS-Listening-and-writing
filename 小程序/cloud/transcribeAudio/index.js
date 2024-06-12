// 引入 axios 来发送 HTTP 请求
const axios = require('axios');

exports.main = async (event, context) => {
  const { speech, len, cuid } = event;

  // 构造请求体
  const data = {
    format: 'm4a',
    rate: 16000,
    channel: 1,
    token: "24.392102e0287389372566ae2368af20c7.2592000.1720340061.282335-78943325",
    cuid: cuid,
    speech: speech,
    len: len
  };

  try {
    // 使用 axios 发送 POST 请求
    const response = await axios({
      method: 'post',
      url: 'https://vop.baidu.com/server_api',
      data: data,
      headers: { 'Content-Type': 'application/json' }
    });

    // 处理响应
    console.log(response.data);
    return { result: response.data };
  } catch (error) {
    console.error('请求失败:', error);
    return { error: error.toString() };
  }
};