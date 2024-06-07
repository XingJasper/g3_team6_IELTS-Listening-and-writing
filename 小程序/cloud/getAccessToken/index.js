const axios = require('axios');

async function main() {
    const options = {
        method: 'POST',
        url: 'https://aip.baidubce.com/oauth/2.0/token',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        params: {
            client_id: 'zNGl9iyCpIs23nfhE5xgkskM',  // 应该替换为您的 Client ID
            client_secret: 'ITSItWstoxCngKBWcGvCU9y98uOir1yY',  // 应该替换为您的 Client Secret
            grant_type: 'client_credentials'
        }
    };

    try {
        const response = await axios(options);
        console.log(response.data);  // 输出响应体的内容
    } catch (error) {
        console.error('Error:', error);
    }
}

main();