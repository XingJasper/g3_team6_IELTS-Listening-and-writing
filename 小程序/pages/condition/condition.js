Page({
  data: {
    showModal: false,
    feedbacks: [],
    username: '', // 当前登录用户的用户名
    loggedIn: false // 登录状态
  },

  onLoad: function() {
    // 检查登录状态
    const app = getApp();
    const loggedIn = app.globalData.loggedIn;
    const username = app.globalData.loggedInUsername;

    console.log('onLoad loggedIn:', loggedIn); // 调试输出

    this.setData({
      loggedIn: loggedIn,
      username: username
    });

    if (!loggedIn) {
      wx.redirectTo({
        url: '/pages/me/me'
      });
    }
  },

  onShow: function() {
    // 检查登录状态
    const app = getApp();
    const loggedIn = app.globalData.loggedIn;
    const username = app.globalData.loggedInUsername;

    console.log('onShow loggedIn:', loggedIn); // 调试输出

    this.setData({
      loggedIn: loggedIn,
      username: username
    });

    if (!loggedIn) {
      wx.redirectTo({
        url: '/pages/me/me'
      });
    }
  },

  // 显示弹窗
  showModal: function() {
    // 获取当前登录用户的所有反馈
    const db = wx.cloud.database();
    db.collection('userWritings').where({
      username: this.data.username
    }).orderBy('submissionDate', 'desc').get({
      success: res => {
        if (res.data.length > 0) {
          const feedbacks = res.data.map(record => record.feedback);
          this.setData({
            feedbacks: feedbacks,
            showModal: true
          });
        } else {
          this.setData({
            feedbacks: []
          });
          wx.showToast({
            title: '没有找到记录',
            icon: 'none'
          });
        }
      },
      fail: err => {
        console.error('获取记录失败', err);
        wx.showToast({
          title: '获取记录失败',
          icon: 'none'
        });
      }
    });
  },

  // 隐藏弹窗
  hideModal: function() {
    this.setData({
      showModal: false
    });
  },

  // 听力情况记录按钮点击事件处理函数
  recordListening: function() {
    console.log("听力情况记录按钮被点击");
    // TODO: 添加具体的听力记录操作
  },

  // 写作情况记录按钮点击事件处理函数
  recordWriting: function() {
    console.log("写作情况记录按钮被点击");
    this.showModal();
  }
});