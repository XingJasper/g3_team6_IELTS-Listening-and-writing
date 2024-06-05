// pages/speakingPart1/speakingPart1.js

const options = {
    duration: 60000, // 最长录音时长（ms）
    sampleRate: 44100, // 采样率
    numberOfChannels: 1, // 录音通道数
    encodeBitRate: 96000, // 编码码率
    format: 'mp3' // 音频格式
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
      score: null,
      feedback: ''
    },
  
    onLoad: function() {
      this.setInitialCategory();
      // 绑定 recorderManager 事件
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
      if (!this.data.audioPath) {
        wx.showToast({
          title: '请先录音',
          icon: 'none'
        });
        return;
      }
      console.log('上传录音', this.data.audioPath);
      // 这里添加具体的上传逻辑
    }
  });
  