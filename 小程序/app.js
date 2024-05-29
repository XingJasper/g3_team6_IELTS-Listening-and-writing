// app.js

const app = getApp();  // 获取小程序全局应用实例


App({
  onLaunch() {
    wx.cloud.init({
      //云开发环境id
      env: 'ielts-0gyw5rst782d2e3b'  
    }),

    //调用云函数
    wx.cloud.callFunction({
      name: 'get_openId',
      success: res => {
        //获取用户openid
        this.globalData.user_openid = res.result.openid
        console.log(this.globalData.user_openid)
      }
    })
  },
  //全局数据
  globalData: {
    //用户openid
    user_openid: '',
    //用户信息
    userInfo: null
  }
})

