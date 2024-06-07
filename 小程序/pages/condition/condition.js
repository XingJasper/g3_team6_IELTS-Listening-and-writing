// pages/condition/condition.js
Page({
  data: {
    showModal: false,
    feedbacks: []
  },

  // 显示弹窗
  showModal: function() {
    this.setData({
      showModal: true
    });

    // 获取所有反馈
    const db = wx.cloud.database();
    db.collection('userWritings').orderBy('submissionDate', 'desc').get({
      success: res => {
        if (res.data.length > 0) {
          const feedbacks = res.data.map(record => record.feedback);
          this.setData({
            feedbacks: feedbacks
          });
        } else {
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