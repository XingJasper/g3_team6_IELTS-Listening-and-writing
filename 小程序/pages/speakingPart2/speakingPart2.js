Page({
    data: {
        categories: [
            { id: 1, name: '工作', questions: ['Describe a job you would like to have in the future.', 'Describe an experience where you had to work as part of a team.', 'Describe a challenging situation at work and how you handled it.', 'Describe someone at work who has inspired you.'] },
            { id: 2, name: '学习', questions: ['Describe a subject you enjoyed studying at school.', 'Describe a time when you learned something new.', 'Describe your experience of learning a foreign language.', 'Describe a useful skill you learned in a class.'] },
            { id: 3, name: '爱好', questions: ['Describe an interesting hobby you know about.', 'Describe a book you have read recently and enjoyed.', 'Describe a movie you watched recently and liked.', 'Describe a sport or game that you enjoy playing.'] }
        ],
        
        currentCategory: null,
        currentQuestion: '',
        recording: false,
        audioPath: '',
        transcript: '',
        rawTranscriptionResult: '',
        score: null,
        feedback: '',
        username: '' // 添加一个字段来存储用户名
    },

    onLoad: function(options) {
        // 获取全局用户名
        const app = getApp();
        const username = app.globalData.loggedInUsername;

        this.setData({
            username: username
        });
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
            this.uploadAndTranscribe();
        });

        this.recorderManager.onError((res) => {
            console.log('Recorder error', res);
            wx.showToast({
                title: '录音失败，请重试',
                icon: 'none'
            });
            this.setData({ recording: false });
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
        if (this.data.recording) {
            this.recorderManager.stop();
            console.log('停止录音');
        }
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
            title: '上传中...',
        });

        const cloudPath = `audio/${Date.now()}-${Math.floor(Math.random() * 1000)}.pcm`;
        wx.cloud.uploadFile({
            cloudPath: cloudPath,
            filePath: audioPath,
            success: res => {
                console.log('上传成功', res.fileID);
                // 上传成功后调用转写函数
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
                wx.showToast({
                                    title: '提交成功',
                                    icon: 'success'
                                });
                if (res.result.err_no !== 0) {
                    wx.showToast({
                        title: res.result.err_msg,
                        icon: 'none'
                    });
                } else {
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
            .limit(1)
            .get({
                success: res => {
                    if (res.data.length > 0) {
                        this.setData({
                            transcript: res.data[0].transcription
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
    },

    updateTranscript: function(e) {
        this.setData({
            transcript: e.detail.value
        });
    },

    submitForScoring: function() {
        const { transcript, currentQuestion } = this.data;
        if (!transcript) {
            wx.showToast({
                title: '请先转写或输入文本',
                icon: 'none'
            });
            return;
        }

        wx.showLoading({
            title: '正在提交...',
        });

        wx.cloud.callFunction({
            name: 'evaluateSpeakingPart2',
            data: {
                writingContent: transcript,
                question: currentQuestion  // 将当前问题作为参数传递

            },
            success: res => {
                console.log('评分结果', res.result);
                if (res.result && res.result.success) {
                    const feedbackLines = res.result.feedback.split('\n');
                    const scoreLine = feedbackLines.find(line => line.startsWith('分数：'));
                    const feedbackLine = feedbackLines.find(line => line.startsWith('评语：'));

                    const score = scoreLine ? scoreLine.split('：')[1].trim() : 'N/A';
                    const feedback = feedbackLine ? feedbackLine.split('：')[1].trim() : 'N/A';

                    // 更新页面数据并保存评分结果到数据库
                    this.setData({ score, feedback }, () => {
                        const db = wx.cloud.database();
                        db.collection('userSpeakings').add({
                            data: {
                                cuid: this.cuid,
                                transcript: transcript,
                                score: score,
                                feedback: feedback,
                                username: this.data.username, // 添加用户名字段
                                timestamp: new Date(),
                            },
                            success: saveResult => {
                                console.log('保存评分结果到数据库:', saveResult);
                                wx.showToast({
                                    title: '提交成功',
                                    icon: 'success'
                                });
                            },
                            fail: saveError => {
                                console.error('保存评分结果失败:', saveError);
                                wx.showToast({
                                    title: '保存评分结果失败，请重试',
                                    icon: 'none'
                                });
                            },
                            complete: () => {
                                wx.hideLoading();
                            }
                        });
                    });
                } else {
                    wx.showToast({
                        title: res.result.error || '评分失败，请重试',
                        icon: 'none'
                    });
                    wx.hideLoading();
                }
            },
            fail: err => {
                console.error('评分失败', err);
                wx.showToast({
                    title: '评分失败，请重试',
                    icon: 'none'
                });
                wx.hideLoading();
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
