App({
  onLaunch() {
    // 初始化云环境
    wx.cloud.init({
      env: 'ielts-0gyw5rst782d2e3b'
    });

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);

    // 调用云函数获取用户 openid
    wx.cloud.callFunction({
      name: 'get_openId',
      success: res => {
        // 获取用户 openid
        this.globalData.user_openid = res.result.openid;
        console.log(this.globalData.user_openid);
      }
    });

    // 初始化全局数据
    this.globalData = {
      user_openid: '',
      userInfo: null,
      loggedIn: wx.getStorageSync('loggedIn') || false,
      loggedInUsername: wx.getStorageSync('loggedInUsername') || ''
    };
  },

  onShow(options) {
    // 在应用显示时检查登录状态
    const loggedIn = wx.getStorageSync('loggedIn') || false;
    const loggedInUsername = wx.getStorageSync('loggedInUsername') || '';
    this.globalData.loggedIn = loggedIn;
    this.globalData.loggedInUsername = loggedInUsername;

    // 检查如果没有登录并且当前页面不是me页面，则跳转到me页面
    if (!loggedIn && options.path !== 'pages/me/me') {
      wx.redirectTo({
        url: '/pages/me/me'
      });
    }
  },

  globalData: {
    user_openid: '',
    userInfo: null,
    loggedIn: false,
    loggedInUsername: ''
  }
});