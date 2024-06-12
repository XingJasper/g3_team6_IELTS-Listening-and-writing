const options = {
  duration: 60000, // 最长录音时长（ms）
  sampleRate: 16000, // 采样率
  numberOfChannels: 1, // 录音通道数
  encodeBitRate: 96000, // 编码码率
  format: 'aac' // 音频格式
};

Page({
  data: {
    categories: [
      { id: 1, name: '工作', questions: ['Can you describe your job?', 'How do you feel about your coworkers?'] },
      { id: 2, name: '学习', questions: ['What subject are you studying?', 'Why did you choose this subject?'] },
      { id: 3, name: '爱好', questions: ['Do you have any hobbies?', 'How did you start this hobby?'] }
    ],
    currentCategory: null,
    currentQuestion: '',
    recording: false,
    audioPath: '',
    transcript: '',
    score: null,
    feedback: ''
  },

  onLoad: function() {
    this.setInitialCategory();
    this.recorderManager = wx.getRecorderManager();

    this.recorderManager.onStart(() => {
      console.log('Recorder start');
    });

    this.recorderManager.onStop((res) => {
      console.log('Recorder stop', res);
      this.setData({
        audioPath: res.tempFilePath,
        recording: false
      });
      this.convertAndUploadAudio(res.tempFilePath);
    });

    this.recorderManager.onError((res) => {
      console.log('Recorder error', res);
      wx.showToast({
        title: '录音失败，请重试',
        icon: 'none'
      });
    });

    this.cuid = this.getCUID();
  },

  getCUID: function() {
    const systemInfo = wx.getSystemInfoSync();
    return `${systemInfo.model}-${systemInfo.system}`;
  },

  setInitialCategory: function() {
    const initialCategory = this.data.categories[0];
    this.setData({
      currentCategory: initialCategory,
      currentQuestion: this.getRandomQuestion(initialCategory.questions)
    });
  },

  onCategoryChange: function(e) {
    const newCategory = this.data.categories[e.detail.value];
    this.setData({
      currentCategory: newCategory,
      currentQuestion: this.getRandomQuestion(newCategory.questions)
    });
  },

  refreshQuestion: function() {
    this.setData({
      currentQuestion: this.getRandomQuestion(this.data.currentCategory.questions)
    });
  },

  getRandomQuestion: function(questions) {
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  },

  startRecording: function() {
    this.setData({ recording: true });
    this.recorderManager.start(options);
    console.log('开始录音');
  },

  stopRecording: function() {
    this.recorderManager.stop();
    console.log('停止录音');
  },

  convertAndUploadAudio: function(filePath) {
    // 读取录音文件并转换为 base64
    const fileSystemManager = wx.getFileSystemManager();
    fileSystemManager.readFile({
      filePath: filePath,
      encoding: 'base64',
      success: res => {
        console.log('文件转换为 base64 成功');
        const base64Data = res.data;
        const len = this.getBase64Length(base64Data); // 计算音频数据的字节长度

        // 打印调试信息
        console.log('Base64 Data:', base64Data);
        console.log('Length:', len);

        // 调用上传和转写函数
        this.uploadAndTranscribe(filePath, base64Data, len);
      },
      fail: err => {
        console.error('读取文件失败:', err);
        wx.showToast({
          title: '文件读取失败',
          icon: 'none'
        });
      }
    });
  },

  getBase64Length: function(base64) {
    // 去掉 base64 编码中的等号
    const cleanBase64 = base64.replace(/=+$/, '');
    return Math.floor(cleanBase64.length * 3 / 4);
  },

  uploadAndTranscribe: function(filePath, base64Data, len) {
    wx.showLoading({
      title: '正在转写...',
    });

    // 构建云路径
    const cloudPath = `audio/${Date.now()}-${Math.floor(Math.random() * 1000)}.m4a`;

    // 上传文件到云存储
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath,
      success: res => {
        console.log('上传成功', res.fileID);
        // 调用云函数进行语音转写
        this.callTranscribeFunction(res.fileID, base64Data, len);
      },
      fail: err => {
        console.error('上传失败', err);
        wx.showToast({
          title: '上传失败，请重试',
          icon: 'none'
        });
        wx.hideLoading();
      }
    });
  },

  callTranscribeFunction: function(fileID, base64Data, len) {
    // 调用云函数进行语音转写
    wx.cloud.callFunction({
      name: 'transcribeAudio',
      data: {
        fileID: fileID,
        speech: base64Data,
        len: len,
        cuid: this.cuid
      },
      success: res => {
        console.log('转写结果', res.result);
        if (res.result.error) {
          wx.showToast({
            title: '转写错误: ' + res.result.error,
            icon: 'none'
          });
        } else {
          this.setData({
            transcript: res.result.result
          });
        }
        wx.hideLoading();
      },
      fail: err => {
        console.error('调用转写失败', err);
        wx.showToast({
          title: '转写失败，请重试',
          icon: 'none'
        });
        wx.hideLoading();
      }
    });
  }
});