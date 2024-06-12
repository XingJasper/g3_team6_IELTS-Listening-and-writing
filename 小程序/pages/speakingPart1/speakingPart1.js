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
      rawTranscriptionResult: '',
      score: null,
      feedback: ''
    },
  
    onLoad: function() {
      this.setInitialCategory();
      this.recorderManager = wx.getRecorderManager();
  
      this.recorderManager.onStart(() => {
        console.log('Recorder start');
      });
  
      this.cuid = this.getCUID();
  
      this.recorderManager.onStop((res) => {
        console.log('Recorder stop', res);
        this.setData({
          audioPath: res.tempFilePath,
          recording: false
        });
      });
  
      this.recorderManager.onError((res) => {
        console.log('Recorder error', res);
        wx.showToast({
          title: '录音失败，请重试',
          icon: 'none'
        });
      });
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
      this.recorderManager.start({
        duration: 60000,
        sampleRate: 16000,
        numberOfChannels: 1,
        encodeBitRate: 96000,
        format: 'pcm'
      });
      console.log('开始录音');
    },
  
    stopRecording: function() {
      this.setData({ recording: false });
      this.recorderManager.stop();
      console.log('停止录音');
    },
  
    uploadAndTranscribe: function() {
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
  
      const cloudPath = `audio/${Date.now()}-${Math.floor(Math.random() * 1000)}.pcm`;
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
        data: {
          fileID: fileID,
          cuid: this.cuid
        },
        success: res => {
          console.log('转写结果', res.result);
          if (res.result.err_no !== 0) {
            wx.showToast({
              title: res.result.err_msg,
              icon: 'none'
            });
          } else {
            // 在转写成功后从数据库获取最新的转写内容
            this.fetchLatestTranscription();
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
  
    fetchLatestTranscription: function() {
      const db = wx.cloud.database();
      db.collection('transcriptions').orderBy('timestamp', 'desc').limit(1).get({
        success: res => {
          if (res.data.length > 0) {
            this.setData({
              transcript: res.data[0].transcription
            });
          } else {
            wx.showToast({
              title: '没有找到转写记录',
              icon: 'none'
            });
          }
        },
        fail: err => {
          console.error('获取转写记录失败', err);
          wx.showToast({
            title: '获取转写记录失败',
            icon: 'none'
          });
        }
      });
    },
  
    updateTranscript: function(e) {
      this.setData({
        transcript: e.detail.value
      });
    },
  
    submitForScoring: function() {
      wx.cloud.callFunction({
        name: 'scoreTranscript',
        data: {
          transcript: this.data.transcript
        },
        success: res => {
          console.log('评分结果', res.result);
          if (res.result.error) {
            wx.showToast({
              title: res.result.error,
              icon: 'none'
            });
          } else {
            this.setData({
              score: res.result.score,
              feedback: res.result.feedback
            });
          }
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
  
    retryRecording: function() {
      this.setData({
        audioPath: '',
        transcript: '',
        rawTranscriptionResult: '',
        score: null,
        feedback: ''
      });
      wx.showToast({
        title: '请重新录音',
        icon: 'none'
      });
    }
  });