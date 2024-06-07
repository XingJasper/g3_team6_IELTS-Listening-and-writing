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
      const recorderManager = wx.getRecorderManager();
  
      recorderManager.onStart(() => {
        console.log('Recorder start');
      });
  
      recorderManager.onStop((res) => {
        console.log('Recorder stop', res);
        this.setData({
          audioPath: res.tempFilePath,
          recording: false
        });
      });
  
      recorderManager.onError((res) => {
        console.log('Recorder error', res);
        wx.showToast({
          title: '录音失败，请重试',
          icon: 'none'
        });
      });
  
      this.recorderManager = recorderManager;
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
      this.setData({ recording: false });
      this.recorderManager.stop();
      console.log('停止录音');
    },
  
    uploadAudio: function() {
      const { audioPath } = this.data;
      if (!audioPath) {
        wx.showToast({
          title: '请先录音',
          icon: 'none'
        });
        return;
      }
  
      wx.showLoading({
        title: '上传中',
      });
  
      const cloudPath = `audio/${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}.m4a`;
      wx.cloud.uploadFile({
        cloudPath,
        filePath: audioPath,
        success: res => {
          console.log('上传成功', res.fileID);
          this.callFunctionForTranscription(res.fileID);
        },
        fail: err => {
          console.error('上传失败', err);
          wx.showToast({
            title: '上传失败，请重试',
            icon: 'none'
          });
        },
        complete: () => {
          wx.hideLoading();
        }
      });
    },
    
    callFunctionForTranscription: function(fileID) {
      wx.cloud.callFunction({
        name: 'transcribeAudio',
        data: { fileID },
        success: res => {
          console.log('转写结果', res.result);
          if (res.result.error) {
            wx.showToast({
              title: res.result.error,
              icon: 'none'
            });
          } else {
            this.setData({
              transcript: res.result.transcript
            });
          }
        },
        fail: err => {
          console.error('转写失败', err);
          wx.showToast({
            title: '转写失败，请重试',
            icon: 'none'
          });
        }
      });
    },
  
    submitForScoring: function() {
      const { transcript } = this.data;
      wx.request({
        url: 'https://api.example.com/score', // 替换为你的GPT API URL
        method: 'POST',
        data: { transcript },
        success: res => {
          console.log('评分结果', res.data);
          this.setData({
            score: res.data.score,
            feedback: res.data.feedback
          });
        },
        fail: err => {
          console.error('评分失败', err);
          wx.showToast({
            title: '评分失败，请重试',
            icon: 'none'
          });
        }
      });
    },
  
    updateTranscript: function(e) {
      this.setData({
        transcript: e.detail.value
      });
    }
  });
  