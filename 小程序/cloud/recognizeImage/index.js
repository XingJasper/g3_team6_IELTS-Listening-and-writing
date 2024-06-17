const cloud = require('wx-server-sdk');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

cloud.init();

async function recognizeImage(imageURL, model = 'gpt-4o') {
  const apiUrl = 'https://api.hmbb313.top/v1/chat/completions'; // 使用聊天完成端点
  const apiKey = 'sk-ywpVIbyhkKRDNXbrBd82D64e92D44a328a52070247DaE685'; // 替换为实际的API Key

  console.log('Downloading image from URL:', imageURL);

  // 对 URL 进行编码
  const encodedImageURL = encodeURI(imageURL);

  // 下载文件到本地临时路径
  const tempFilePath = path.join('/tmp', `${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`);
  const writer = fs.createWriteStream(tempFilePath);
  const downloadResponse = await axios({
    url: encodedImageURL,
    method: 'GET',
    responseType: 'stream'
  });
  downloadResponse.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  console.log('File downloaded to:', tempFilePath);

  // 读取文件内容
  const imageBuffer = fs.readFileSync(tempFilePath);

  // 删除临时文件
  fs.unlinkSync(tempFilePath);

  // 指令提示
  const prompt = `请对以下图像进行描述并给出反馈。`;

  try {
    const response = await axios.post(
      apiUrl,
      {
        messages: [
          {
            role: "user",
            content: prompt
          },
          {
            role: "system",
            name: "image",
            image: {
              data: imageBuffer.toString('base64')
            }
          }
        ],
        model: model,
        max_tokens: 150,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data.choices || response.data.choices.length === 0) {
      throw new Error('Invalid API response');
    }

    const result = response.data.choices[0].message.content.trim();

    return {
      success: true,
      feedback: result
    };
  } catch (error) {
    console.error('Error calling API:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

exports.main = async (event, context) => {
  const { imageURL, model } = event;
  return recognizeImage(imageURL, model);
};