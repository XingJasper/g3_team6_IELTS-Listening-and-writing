// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { username, password, phone } = event

  try {
    const userExists = await db.collection('Login').where({
      username: username
    }).get()

    if (userExists.data.length > 0) {
      return {
        success: false,
        message: '用户名已存在'
      }
    }

    await db.collection('Login').add({
      data: {
        username: username,
        password: password,
        phone: phone
      }
    })

    return {
      success: true,
      message: '注册成功'
    }
  } catch (e) {
    return {
      success: false,
      message: e.message
    }
  }
}