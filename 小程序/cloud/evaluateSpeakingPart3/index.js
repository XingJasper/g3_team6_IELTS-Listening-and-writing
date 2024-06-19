const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init();

exports.main = async (event, context) => {
    const { writingContent, question } = event; // 接收传入的question变量

  // API URL and Key
  const apiUrl = 'https://api.hmbb313.top/v1/chat/completions';
  const apiKey = 'sk-ywpVIbyhkKRDNXbrBd82D64e92D44a328a52070247DaE685';

  // 指令提示
  const prompt = `你现在是一个雅思考官，请对学生所写的雅思口语Part3部分（语言转文字的结果）打分，并给出简短的中文评语（50字以内）。雅思写作评分依据四个标准：1. 流利度和连贯性	2.词汇资源 3. 语法范围和准确性。4. 发音 以下是雅思口语题目：“${question}” 输出格式为："分数：<分数>\\n评语：<评语>"。以下是学生的回答：\n\n${writingContent}`;

  try {
    const response = await axios.post(
      apiUrl,
      {
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: 'gpt-3.5-turbo',
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
};