const axios = require('axios');
const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database();

exports.main = async (event, context) => {
  const { fileID, cuid } = event;

  try {
    // 获取文件临时链接
    const result = await cloud.getTempFileURL({
      fileList: [fileID],
    });

    const fileUrl = result.fileList[0].tempFileURL;
    console.log('File URL:', fileUrl);

    // 下载文件并转换为 base64
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const audioBuffer = Buffer.from(response.data, 'binary');
    const audioBase64 = audioBuffer.toString('base64');

    console.log('Audio Buffer Length:', audioBuffer.length);
    console.log('Audio Base64 Sample:', audioBase64.substring(0, 100)); // 输出部分 base64 字符串用于检查

    // 百度语音转文字API请求数据
    const data = {
      format: 'pcm',
      rate: 16000,
      channel: 1,
      token: "24.392102e0287389372566ae2368af20c7.2592000.1720340061.282335-78943325",
      cuid: cuid,
      speech: audioBase64,
      len: audioBuffer.length
    };

    console.log('Request Data:', data);

    // 调用百度语音转文字API
    const asrResponse = await axios({
      method: 'post',
      url: 'https://vop.baidu.com/server_api',
      data: data,
      headers: { 'Content-Type': 'application/json' }
    });

    const transcriptionResult = asrResponse.data;
    console.log('ASR Response:', transcriptionResult);

    if (transcriptionResult.err_no === 0) {
      const transcription = transcriptionResult.result[0];
      
      // 保存转写结果到数据库
      const saveResult = await db.collection('transcriptions').add({
        data: {
          cuid: cuid,
          fileID: fileID,
          transcription: transcription,
          timestamp: new Date(),
        }
      });

      console.log('保存转写结果到数据库:', saveResult);
      return { result: transcriptionResult, dbResult: saveResult };
    } else {
      return { result: transcriptionResult };
    }
  } catch (error) {
    console.error('请求失败:', error);
    return { error: error.toString() };
  }
};