// me.js
Page({
  data: {
    // Initialize data properties here
  },

  login: function() {
    wx.login({
      success: (res) => {
        if (res.code) {
          wx.request({
            url: 'your-backend-api-url/api/auth/login', // Replace with your actual API URL
            method: 'POST',
            data: {
              code: res.code
            },
            success: (res) => {
              console.log('Login successful', res.data);
              // Further success logic here, like storing tokens
            },
            fail: (err) => {
              console.error('Request to backend failed', err);
            }
          });
        } else {
          console.log('Login failed: ' + res.errMsg);
        }
      },
      fail: (err) => {
        console.log('wx.login failed: ' + err.errMsg);
      }
    });
  },

  // Other methods here
});