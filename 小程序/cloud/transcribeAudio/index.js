// 引入依赖
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init();

// 主函数
exports.main = async (event, context) => {
    const { fileID } = event; // 接收前端传来的 fileID

    try {
        // 先调用获取 access_token 的云函数
        const accessTokenResponse = await cloud.callFunction({
            name: 'getAccessToken'
        });
        const accessToken = accessTokenResponse.result.access_token;

        // 获取文件临时访问URL
        const fileResult = await cloud.getTempFileURL({
            fileList: [fileID]
        });
        const fileUrl = fileResult.fileList[0].tempFileURL;

        // 调用百度语音识别API
        const response = await axios({
            method: 'POST',
            url: 'https://vop.baidu.com/server_api',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                format: "m4a",
                rate: 16000,
                channel: 1,
                token: accessToken,
                cuid: "ZjHFoZMw23AuXoVEO2q8eVMNGGvMEGnP",
                speech: event.speech,
                len: event.len
            }
        });

        // 处理API的响应
        if (response.data) {
            return { result: response.data };
        } else {
            throw new Error("No response from Baidu API");
        }
    } catch (error) {
        console.error(error);
        return { error: error.toString() };
    }
};