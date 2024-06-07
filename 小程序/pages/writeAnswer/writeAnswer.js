Page({
  data: {
    imageURL: '',
    writingContent: '',
    feedback: ''
  },

  onLoad: function(options) {
    if (options.image) {
      this.setData({
        imageURL: options.image
      });
    }
  },

  bindInput: function(e) {
    this.setData({
      writingContent: e.detail.value
    });
  },

  submitWriting: function() {
    const { imageURL, writingContent } = this.data;
    
    // 计算字数
    const wordCount = writingContent.split(/\s+/).filter(word => word.length > 0).length;

    // 检查字数是否不足100
    if (wordCount < 100) {
      wx.showToast({
        title: '请再多写一点，至少100词',
        icon: 'none'
      });
      return; // 不继续提交
    }

    wx.showLoading({
      title: '正在提交...',
    });

    wx.cloud.callFunction({
      name: 'evaluateWriting',
      data: {
        writingContent: writingContent
      },
      success: res => {
        wx.hideLoading();
        console.log('Cloud function response:', res);

        const { success, feedback, error } = res.result;

        if (success) {
          wx.showToast({
            title: '提交成功',
            icon: 'success'
          });
          this.setData({
            feedback: feedback
          });
          // 将评分和反馈保存到数据库
          const db = wx.cloud.database();
          db.collection('userWritings').add({
            data: {
              imageURL: imageURL,
              writingContent: writingContent,
              feedback: feedback,
              submissionDate: new Date()
            },
            success: res => {
              console.log('写作结果保存成功', res);
            },
            fail: err => {
              console.error('写作结果保存失败', err);
            }
          });
        } else {
          wx.showToast({
            title: `评分失败: ${error}`,
            icon: 'none'
          });
          console.error('评分失败', error);
        }
      },
      fail: err => {
        wx.hideLoading();
        console.error('调用云函数失败', err);
        wx.showToast({
          title: '提交失败',
          icon: 'none'
        });
      }
    });
  }
});