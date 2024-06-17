Page({
  data: {
    username: '',
    password: '',
    isLoggedin: false,
    loggedInUsername: '',
    contactImage: '/images/cnt.jpg', // 确保图片路径正确
    showModal: false // 控制图片弹出层显示状态
  },

  bindUsernameInput: function(e) {
    this.setData({
      username: e.detail.value
    });
  },

  bindPasswordInput: function(e) {
    this.setData({
      password: e.detail.value
    });
  },

  login: function() {
    const { username, password } = this.data;

    // 简单验证
    if (!username || !password) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      });
      return;
    }

    // 调用云函数
    wx.cloud.callFunction({
      name: 'get_openId',
      data: {
        action: 'login',
        username: username,
        password: password
      },
      success: (res) => {
        if (res.result.success) {
          wx.showToast({
            title: res.result.message,
            icon: 'success'
          });
          // 登录成功，设置登录状态和用户名
          this.setData({
            isLoggedin: true,
            loggedInUsername: username
          });
          wx.setStorageSync('loggedIn', true);
          wx.setStorageSync('loggedInUsername', username); // 存储用户名
          const app = getApp();
          app.globalData.loggedIn = true;
          app.globalData.loggedInUsername = username; // 设置全局用户名
     
        } else {
          wx.showToast({
            title: res.result.message,
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '登录失败，请稍后再试',
          icon: 'none'
        });
      }
    });
  },

  logout: function() {
    this.setData({
      isLoggedin: false,
      username: '',
      password: '',
      loggedInUsername: ''
    });
    wx.setStorageSync('loggedIn', false); // 确保清除本地存储中的登录状态
    wx.setStorageSync('loggedInUsername', ''); // 清除本地存储中的用户名
    const app = getApp();
    app.globalData.loggedIn = false;
    app.globalData.loggedInUsername = '';
    wx.showToast({
      title: '已退出登录',
      icon: 'success'
    });
    // 退出登录后跳转到登录页面
    wx.redirectTo({
      url: '/pages/me/me'
    });
  },

  register: function() {
    wx.navigateTo({
      url: '/pages/register/register' // 确保路径正确
    });
  },

  showContactImage: function() {
    this.setData({
      showModal: true // 显示图片弹出层
    });
  },

  closeModal: function() {
    this.setData({
      showModal: false // 关闭图片弹出层
    });
  },

  navigateToUploadPage: function() {
    wx.navigateTo({
      url: '/pages/uploadPage/uploadPage' // 确保路径正确
    });
  }
});