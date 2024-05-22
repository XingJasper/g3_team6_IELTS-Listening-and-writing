// pages/index/index.js
Page({
    data: {},
  
    goToPart1: function() {
      wx.navigateTo({
        url: '/pages/speakingPart1/speakingPart1',
      });
    },
  
    goToPart2: function() {
      wx.navigateTo({
          
        url: '/pages/speakingPart2/speakingPart2',
      });
    },
  
    goToPart3: function() {
      wx.navigateTo({
        url: '/pages/speakingPart3/speakingPart3',
      });
    }
  });
  