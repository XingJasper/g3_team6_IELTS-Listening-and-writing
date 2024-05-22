// pages/speakingPart1/speakingPart1.js
const recorderManager = wx.getRecorderManager();

Page({
  data: {
    recording: false,
    audioPath: '',
    score: null,
    feedback: ''
  },

  onLoad: function() {
    const options = {
      duration: 60000, // 最大录音时长 60 秒
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'mp3',
    };

    recorderManager.onStart(() => {
      console.log('recorder start');
    });

    recorderManager.onStop((res) => {
      console.log('recorder stop', res);
      const { tempFilePath } = res;
      this.setData({ audioPath: tempFilePath, recording: false });
    });

    recorderManager.onError((err) => {
      console.error('recorder error', err);
      wx.showToast({ title: '录音失败', icon: 'none' });
      this.setData({ recording: false });
    });

    this.recorderOptions = options;
  },

  startRecording: function() {
    this.setData({ recording: true });
    recorderManager.start(this.recorderOptions);
  },

  stopRecording: function() {
    recorderManager.stop();
  },

  uploadAudio: function() {
    const filePath = this.data.audioPath;
    if (!filePath) {
      wx.showToast({ title: '请先录音', icon: 'none' });
      return;
    }
    wx.cloud.uploadFile({
      cloudPath: `speakingPart1/${Date.now()}-${Math.floor(Math.random() * 1000)}.mp3`,
      filePath,
      success: res => {
        wx.showToast({ title: '上传成功', icon: 'success' });
        this.evaluateSpeaking(res.fileID);
      },
      fail: err => {
        console.error('上传音频失败', err);
        wx.showToast({ title: '上传失败', icon: 'none' });
      }
    });
  },

  evaluateSpeaking: function(fileID) {
    wx.cloud.callFunction({
      name: 'scoreSpeaking',
      data: { fileID, part: 'part1' },
      success: res => {
        this.setData({ score: res.result.score, feedback: res.result.feedback });
      },
      fail: err => {
        console.error('[云函数] [scoreSpeaking] 调用失败', err);
      }
    });
  }
});
