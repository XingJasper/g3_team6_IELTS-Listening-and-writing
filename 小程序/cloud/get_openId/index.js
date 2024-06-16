// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  const { action, username, password, phone } = event

  if (action === 'login') {
    return await login(username, password, openId)
  } else if (action === 'register') {
    return await register(username, password, phone)
  } else {
    return {
      success: false,
      message: '无效的操作'
    }
  }
}

async function login(username, password, openId) {
  try {
    const user = await db.collection('Login').where({
      username: username,
      password: password
    }).get()

    if (user.data.length > 0) {
      return {
        success: true,
        message: '登录成功',
        openId: openId
      }
    } else {
      return {
        success: false,
        message: '用户名或密码错误'
      }
    }
  } catch (e) {
    return {
      success: false,
      message: e.message
    }
  }
}

async function register(username, password, phone) {
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