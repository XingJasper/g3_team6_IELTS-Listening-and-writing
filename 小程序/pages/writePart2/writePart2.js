Page({
  data: {
    categories: ['其他', '教育', '社会', '科技'], // 新的分类
    selectedCategory: '社会', // 默认分类
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
      part: 'Part 2' // 修改为 Part 2
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