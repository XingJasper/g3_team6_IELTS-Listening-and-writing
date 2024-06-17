// pages/index/index.js
Page({
  data: {
    loggedIn: false,
    username: '' // 添加一个字段来存储用户名
  },

  onLoad: function (options) {
    // 检查登录状态
    const app = getApp();
    const loggedIn = app.globalData.loggedIn;

    console.log('loggedIn:', loggedIn); // 调试输出

    if (!loggedIn) {
      this.setData({
        loggedIn: false
      });
    } else {
      this.setData({
        loggedIn: true,
        username: app.globalData.loggedInUsername // 获取全局用户名
      });
    }
  },

  onShow: function () {
    // 检查登录状态
    const app = getApp();
    const loggedIn = app.globalData.loggedIn;

    console.log('onShow loggedIn:', loggedIn); // 调试输出

    if (!loggedIn) {
      this.setData({
        loggedIn: false
      });
    } else {
      this.setData({
        loggedIn: true,
        username: app.globalData.loggedInUsername // 获取全局用户名
      });
    }
  },
  
    goToPart1: function() {
      wx.navigateTo({
        url: '/pages/speakingPart1/speakingPart1',
      });
    },
  
    goToPart2: function() {
      wx.navigateTo({
          
        url: '/pages/speakingPart2/speakingPart2',
      });
    },
  
    goToPart3: function() {
      wx.navigateTo({
        url: '/pages/speakingPart3/speakingPart3',
      });
    }
  });
  