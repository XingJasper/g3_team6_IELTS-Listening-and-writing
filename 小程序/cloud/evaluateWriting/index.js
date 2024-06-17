const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init();

exports.main = async (event, context) => {
  const { writingContent } = event;

  // API URL and Key
  const apiUrl = 'https://api.hmbb313.top/v1/chat/completions';
  const apiKey = 'sk-ywpVIbyhkKRDNXbrBd82D64e92D44a328a52070247DaE685';

  // 指令提示
  const prompt = `你现在是一个雅思考官，请对学生所写的雅思作文打分，并给出简短的中文评语（50字以内）。作文要求至少150字。不足150字可能会受到扣分。雅思写作评分依据四个标准：任务回应（判断是否全面回答问题）、连贯与衔接（文章结构是否清晰流畅）、词汇丰富性（使用多样和准确的词汇）、语法准确性（语法使用是否正确多样）。输出格式为："分数：<分数>\n评语：<评语>"。以下是学生的作文：\n\n${writingContent}`;

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
        model: 'gpt-4o',
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