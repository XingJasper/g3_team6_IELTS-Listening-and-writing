// write.js
Page({
  navigateToPart1: function() {
    wx.navigateTo({
      url: '/pages/writePart1/writePart1'
    });
  },
  navigateToPart2: function() {
    wx.navigateTo({
      url: '/pages/writePart2/writePart2'
    });
  }
});