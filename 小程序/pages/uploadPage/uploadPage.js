Page({
  data: {
    parts: ['Part 1', 'Part 2'], // 分部分
    selectedPart: 'Part 1', // 默认部分
    categories: ['折线图', '柱状图', '表格', '其他'], // 默认分类
    selectedCategory: '折线图', // 默认分类
    imageURL: ''
  },

  bindPartChange: function(e) {
    const part = this.data.parts[e.detail.value];
    this.setData({
      selectedPart: part,
      categories: part === 'Part 1' ? ['折线图', '柱状图', '表格', '其他'] : ['教育', '科技', '社会', '其他'],
      selectedCategory: part === 'Part 1' ? '折线图' : '教育'
    });
  },

  bindCategoryChange: function(e) {
    this.setData({
      selectedCategory: this.data.categories[e.detail.value]
    });
  },

  chooseImage: function() {
    wx.chooseImage({
      count: 1, // 一次选择一张图片
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const tempFilePath = res.tempFilePaths[0];
        this.setData({
          imageURL: tempFilePath // 显示选择的图片
        });
      }
    });
  },

  uploadImage: function() {
    const { imageURL, selectedCategory, selectedPart } = this.data;
    if (!imageURL) {
      wx.showToast({
        title: '请先选择图片',
        icon: 'none'
      });
      return;
    }

    const cloudPath = `images/${selectedPart}/${selectedCategory}/${new Date().getTime()}-${Math.floor(Math.random() * 1000)}${imageURL.match(/\.[^.]+?$/)[0]}`;

    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: imageURL,
      success: res => {
        console.log('上传成功', res);
        this.saveImageToDatabase(res.fileID, cloudPath, selectedCategory, selectedPart);
      },
      fail: err => {
        console.error('上传失败', err);
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        });
      }
    });
  },

  saveImageToDatabase: function(fileID, cloudPath, category, part) {
    const db = wx.cloud.database();
    db.collection('writingPrompts').add({
      data: {
        promptID: new Date().getTime(),
        image: fileID,
        cloudPath: cloudPath,
        category: category,
        part: part,
        creationDate: new Date()
      },
      success: res => {
        console.log('图片信息保存成功', res);
        wx.showToast({
          title: '上传成功',
          icon: 'success'
        });
        this.setData({
          imageURL: '' // 清空图片预览
        });
      },
      fail: err => {
        console.error('图片信息保存失败', err);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });
  }
});