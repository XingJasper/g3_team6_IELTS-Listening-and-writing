const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
  },
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  onInputChange(e) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  getUserProfile(e) {
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        getApp().globalData.userInfo = res.userInfo // 保存用户信息到 globalData
        this.saveUserInfo(res.userInfo)  // 保存用户信息到数据库
      }
    })
  },
  saveUserInfo(userInfo) {
    wx.cloud.callFunction({
      name: 'get_openId', // 云函数名称
      data: {
        avatarUrl: userInfo.avatarUrl,
        nickName: userInfo.nickName
      },
      success: (res) => {
        console.log('User info saved successfully', res)
        this.login() // 保存成功后进行导航
      },
      fail: (err) => {
        console.error('Failed to save user info', err)
      }
    })
  },
  login() {
    wx.navigateTo({
      url: '../me/me' // 导航到 me 页面
    })
  }
})