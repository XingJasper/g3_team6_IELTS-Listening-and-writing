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

  navigateToPart1: function() {
    if (this.data.loggedIn) {
      wx.navigateTo({
        url: '/pages/writePart1/writePart1'
      });
    } else {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
    }
  },

  navigateToPart2: function() {
    if (this.data.loggedIn) {
      wx.navigateTo({
        url: '/pages/writePart2/writePart2'
      });
    } else {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
    }
  }
});