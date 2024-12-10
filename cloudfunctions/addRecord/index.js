const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { content, imageUrl, createTime, date } = event

  try {
    // 检查当天记录数量
    const countResult = await db.collection('goodThings')
      .where({
        _openid: wxContext.OPENID,
        date: date
      })
      .count()

    if (countResult.total >= 3) {
      return {
        success: false,
        error: '今日记录已达上限'
      }
    }

    // 添加新记录
    const result = await db.collection('goodThings').add({
      data: {
        _openid: wxContext.OPENID,
        content,
        imageUrl,
        createTime,
        date,
        userId: wxContext.OPENID
      }
    })

    return {
      success: true,
      _id: result._id
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err
    }
  }
} 