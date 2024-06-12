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
    rawTranscriptionResult: '', // 新增属性，用于保存转写结果的原始数据
    score: null,
    feedback: ''
  },

  onLoad: function() {
    this.setInitialCategory(); // 设置初始类别
    this.recorderManager = wx.getRecorderManager();

    this.recorderManager.onStart(() => {
      console.log('Recorder start');
    });

    this.cuid = this.getCUID(); // 保存 CUID 到页面实例

    this.recorderManager.onStop((res) => {
      console.log('Recorder stop', res);
      this.setData({
        audioPath: res.tempFilePath,
        recording: false
      });
      this.uploadAudio();
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
        cuid: this.cuid // 传递 CUID
      },
      success: res => {
        console.log('转写结果', res.result);
        if (res.result.err_no !== 0) {
          wx.showToast({
            title: res.result.err_msg,
            icon: 'none'
          });
        } else {
          // 提取并设置转写文本
          const transcription = res.result.result[0]; // 提取转写结果中的第一个元素
          this.setData({
            transcript: transcription,
            rawTranscriptionResult: JSON.stringify(res.result, null, 2) // 保存转写结果的原始数据，格式化为 JSON 字符串
          });
          console.log('转写文本:', this.data.transcript); // 调试用，确保 transcript 被正确设置
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
      rawTranscriptionResult: '', // 重置原始转写结果数据
      score: null,
      feedback: ''
    });
    wx.showToast({
      title: '请重新录音',
      icon: 'none'
    });
  }
  ,
  // 添加上传并转写按钮方法
  uploadAndTranscribe: function() {
      if (!this.data.audioPath) {
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
          cloudPath: cloudPath,
          filePath: this.data.audioPath,
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
              fileID: fileID
          },
          success: res => {
              console.log('转写结果', res.result);
              if (res.result.err_no !== 0) {
                  wx.showToast({
                      title: res.result.err_msg,
                      icon: 'none'
                  });
              } else {
                  // 这里保存转写结果到data并显示
                  this.setData({
                      transcript: res.result.result[0],
                  });
                  // 可选：从数据库获取更多转写结果
                  this.fetchTranscriptions();
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
  
  fetchTranscriptions: function() {
  const db = wx.cloud.database();
  db.collection('transcriptions')
    .orderBy('timestamp', 'desc')
    .limit(1)  // 确保只获取最新的一条记录
    .get({
        success: res => {
            console.log('查询成功，返回数据:', res.data); // 调试信息，看返回什么数据
            if (res.data.length > 0) {
                this.setData({
                    transcript: res.data[0].transcription  // 直接设置第一条记录的转写文本
                });
            } else {
                wx.showToast({
                    title: '未找到转写数据',
                    icon: 'none'
                });
            }
        },
        fail: err => {
            console.error('获取转写数据失败', err);
            wx.showToast({
                title: '获取数据失败，请重试',
                icon: 'none'
            });
        }
    });
}
,
  // 确保你在小程序代码的某个函数内部调用这段代码，不要在控制台直接执行
fetchLatestTranscription: function() {
  const db = wx.cloud.database();
  db.collection('userWritings').orderBy('submissionDate', 'desc').get({
    success: res => {
      if (res.data.length > 0) {
        const feedbacks = res.data.map(record => record.feedback);
        this.setData({
          feedbacks: feedbacks
        });
      } else {
        wx.showToast({
          title: '没有找到记录',
          icon: 'none'
        });
      }
    },
    fail: err => {
      console.error('获取记录失败', err);
      wx.showToast({
        title: '获取记录失败',
        icon: 'none'
      });
    }
  });

}

  
  
  
  


});