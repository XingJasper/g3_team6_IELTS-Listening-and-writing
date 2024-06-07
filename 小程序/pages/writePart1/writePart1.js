Page({
  data: {
    categories: ['折线图', '柱状图', '表格', '其他'], // Part 1 的分类
    selectedCategory: '折线图', // 默认分类
    prompts: [],
    currentImage: '',
    currentIndex: 0
  },

  onLoad: function() {
    this.getPrompts();
  },

  getPrompts: function() {
    const db = wx.cloud.database();
    const { selectedCategory } = this.data;
    db.collection('writingPrompts').where({
      category: selectedCategory,
      part: 'Part 1'
    }).get({
      success: res => {
        this.setData({
          prompts: res.data,
          currentImage: res.data.length > 0 ? res.data[0].image : '',
          currentIndex: 0
        });
      },
      fail: console.error
    });
  },

  chooseImage: function() {
    const { prompts, currentIndex } = this.data;
    if (prompts.length === 0) return;
    const nextIndex = (currentIndex + 1) % prompts.length;
    this.setData({
      currentIndex: nextIndex,
      currentImage: prompts[nextIndex].image
    });
  },

  startAnswering: function() {
    wx.navigateTo({
      url: '../writeAnswer/writeAnswer?image=' + this.data.currentImage
    });
  },

  bindCategoryChange: function(e) {
    this.setData({
      selectedCategory: this.data.categories[e.detail.value]
    }, () => {
      this.getPrompts();
    });
  }
});