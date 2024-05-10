// 假设 wx.login 已成功获取到了 code
wx.login({
    success: function(loginResult) {
      if (loginResult.code) {
        // 初始化请求任务
        const requestTask = wx.request({
          url: 'http://localhost:8088/api/auth', // 将 URL 设置为你的后端登录接口
          method: 'POST', // 使用 POST 方法
          data: {
            code: loginResult.code // 发送登录用的 code
          },
          header: {
            'content-type': 'application/json' // 设置请求头
          },
          success (res) {
            // 请求成功的回调函数
            console.log('登录成功:', res.data);
          },
          fail (error) {
            // 请求失败的回调函数
            console.error('请求失败:', error);
          }
        });
  
        // 如果需要在某个条件下中断请求，可以调用 requestTask.abort()
        // 比如设置一个条件或者延时来中断请求
        setTimeout(() => {
          requestTask.abort(); // 中断请求
          console.log('请求已被中断');
        }, 5000); // 假设在5秒后中断，根据实际需求调整时间
      } else {
        console.log('获取用户登录态失败！' + loginResult.errMsg);
      }
    }
  });
  