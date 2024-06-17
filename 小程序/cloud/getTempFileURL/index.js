const cloud = require('wx-server-sdk');

cloud.init();

exports.main = async (event, context) => {
  const { fileId } = event;
  console.log('File ID received:', fileId);

  // Ensure fileId is a string
  if (typeof fileId !== 'string') {
    return {
      success: false,
      error: 'fileId must be a string'
    };
  }

  try {
    const result = await cloud.getTempFileURL({
      fileList: [fileId] // 确保 fileId 是字符串
    });

    console.log('getTempFileURL result:', result);

    if (result.fileList[0].status === 0) {
      return {
        success: true,
        tempFileURL: result.fileList[0].tempFileURL
      };
    } else {
      console.error('Error: 获取临时文件URL失败, status:', result.fileList[0].status);
      return {
        success: false,
        error: `获取临时文件URL失败，status: ${result.fileList[0].status}`
      };
    }
  } catch (error) {
    console.error('Error getting temp file URL:', error);
    return {
      success: false,
      error: error.message
    };
  }
};