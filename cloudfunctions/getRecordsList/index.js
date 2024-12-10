const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { page = 1, pageSize = 20 } = event
  const skip = (page - 1) * pageSize

  try {
    // 分页获取记录列表
    const result = await db.collection('goodThings')
      .where({
        _openid: wxContext.OPENID
      })
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    return {
      data: result.data
    }
  } catch (err) {
    console.error(err)
    return {
      data: [],
      error: err
    }
  }
} 