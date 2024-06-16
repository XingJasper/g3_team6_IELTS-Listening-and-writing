Page({
  data: {
    username: '',
    password: '',
    phone: ''
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

  bindPhoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  register: function() {
    const { username, password, phone } = this.data;

    // 简单验证
    if (!username || !password || !phone) {
      wx.showToast({
        title: '请输入所有字段',
        icon: 'none'
      });
      return;
    }

    // 验证手机号长度
    if (phone.length !== 11) {
      wx.showToast({
        title: '手机号必须为11位',
        icon: 'none'
      });
      return;
    }

    // 调用云函数进行注册
    wx.cloud.callFunction({
      name: 'get_openId',
      data: {
        action: 'register',
        username: username,
        password: password,
        phone: phone
      },
      success: function(res) {
        console.log('注册成功：', res);
        if (res.result.success) {
          wx.showToast({
            title: res.result.message,
            icon: 'success'
          });
          console.log('即将跳转到 me 页面');
          // 注册成功后跳转到 me 页面
          wx.navigateTo({
            url: 'pages/me/me' // 确保路径正确
          });
        } else {
          wx.showToast({
            title: res.result.message,
            icon: 'none'
          });
        }
      },
      fail: function(err) {
        console.log('注册失败：', err);
        wx.showToast({
          title: '注册失败，请稍后再试',
          icon: 'none'
        });
      }
    });
  }
});