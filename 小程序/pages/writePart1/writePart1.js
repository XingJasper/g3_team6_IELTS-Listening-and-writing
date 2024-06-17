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
  getPrompts: function() {
    const db = wx.cloud.database();
    const { selectedCategory } = this.data;
    db.collection('writingPrompts').where({
      category: selectedCategory,
      part: 'Part 1'
    }).get({
      success: res => {
        console.log('Prompts received:', res.data);
        this.setData({
          prompts: res.data,
          currentImage: res.data.length > 0 ? res.data[0].image : '',
          currentIndex: 0,
          currentFileId: res.data.length > 0 ? res.data[0]._id : '' // 假设 _id 是文件 ID
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
      currentImage: prompts[nextIndex].image,
      currentFileId: prompts[nextIndex]._id // 更新文件 ID
    });
  },

  startAnwsering: function() {
    const { currentImage } = this.data;
    console.log('Using image URL for analysis:', currentImage);
    wx.cloud.callFunction({
      name: 'recognizeImage',
      data: {
        imageURL: currentImage
      },
      success: res => {
        if (res.result.success) {
          const feedback = res.result.feedback;
          console.log('Feedback:', feedback);
          const db = wx.cloud.database();
          db.collection('writeProblem').add({
            data: {
              image: currentImage,
              feedback: feedback,
              createTime: new Date()
            },
            success: res => {
              console.log('Feedback saved to writeProblem:', res);
              wx.navigateTo({
                url: `../writeAnswer/writeAnswer?image=${currentImage}&feedback=${feedback}`
              });
            },
            fail: err => {
              console.error('Error saving feedback to writeProblem:', err);
            }
          });
        } else {
          console.error('Error:', res.result.error);
        }
      },
      fail: err => {
        console.error('Error calling recognizeImage cloud function:', err);
      }
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