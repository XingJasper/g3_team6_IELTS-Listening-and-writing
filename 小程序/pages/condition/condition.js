// pages/home/home.js
const app = getApp();  // 获取小程序全局应用实例

Page({
  data: {
    userInfo: null,
    showSupportImageModal: false // 新增Modal显示控制
  },

  showSupportImageModal() {
    this.setData({
      showSupportImageModal: true
    });
  },

  hideSupportImageModal() {
    this.setData({
      showSupportImageModal: false
    });
  },

  // 登录方法
  login() {
    // 使用 wx.getUserProfile 获取用户信息
    wx.getUserProfile({
      desc: '获取用户信息以便提供更好的服务', // 添加描述
      success: profileRes => {
        console.log('获取用户信息成功', profileRes.userInfo);
        const user = profileRes.userInfo;

        // 设置全局用户信息
        app.globalData.userInfo = user;

        // 设置局部用户信息
        this.setData({
          userInfo: user
        });

        // 将数据添加到数据库
        wx.cloud.database().collection('userInfo').add({
          data: {
            avatarUrl: user.avatarUrl,
            nickName: user.nickName
          },
          success: dbRes => {
            console.log('用户信息存储成功', dbRes);
          },
          fail: err => {
            console.error('用户信息存储失败', err);
          }
        });

        // 调用云函数获取 openid 等身份标识符
        wx.cloud.callFunction({
          name: 'login', // 替换为您的云函数名称
          success: cloudRes => {
            console.log('云函数调用成功', cloudRes.result);
            // 可以将 openid 存储到全局数据或本地存储中
            app.globalData.openid = cloudRes.result.openid;
          },
          fail: err => {
            console.error('云函数调用失败', err);
          }
        });
      },
      fail: err => {
        console.error('获取用户信息失败', err);
      }
    });
  },

  // 登出方法
  logout() {
    app.globalData.userInfo = null;
    this.setData({
      userInfo: null
    });
  },

  // 添加题目
  addQuestion() {
    wx.navigateTo({
      url: '/pages/uploadPage/uploadPage'
    });
  },

  onLoad: function (options) {
    this.setData({
      userInfo: app.globalData.userInfo
    });
  },

  onReady() {},

  onShow() {},

  onHide() {},

  onUnload() {},

  onPullDownRefresh() {},

  onReachBottom() {},

  onShareAppMessage() {}
});