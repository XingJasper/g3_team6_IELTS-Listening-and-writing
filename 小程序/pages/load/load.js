// pages/load/load.js
Page({

  //微信授权登录
  loadByWechat(){
    wx.getUserProfile({
      desc: '用户完善会员资料',
    })
    .then(res=>{
    console.log("用户允许了微信授权登录",res.userInfo);
       //注意：此时不能使用 wx.switchTab，不支持参数传递
       wx.reLaunch({
         //将微信头像和微信名称传递给【我的】页面
         url: '/pages/me/me?nickName='+res.userInfo.nickName+'&tarUrl='+res.userInfo.avatarUrl,
       })
       //保存用户登录信息到缓存
       wx.setStorageSync('userInfo', res.userInfo)
       })
       .catch(err=>{
         console.log("用户拒绝了微信授权登录",err);
       })
     },
   
     //跳转到手机号码登录页
     loadByPhone(){
       wx.navigateTo({
         url: '/pages/loadByPhone/loadByPhone',
       })
     },
   
     //跳转到账号密码登录页
     loadByAccount(){
       wx.navigateTo({
         url: '/pages/loadByAccount/loadByAccount',
       }) 
     },
     
   })