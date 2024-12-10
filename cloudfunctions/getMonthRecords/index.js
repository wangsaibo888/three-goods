const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { startDate, endDate } = event

  try {
    // 获取指定月份的所有记录
    const result = await db.collection('goodThings')
      .where({
        _openid: wxContext.OPENID,
        date: db.command.gte(startDate).and(db.command.lte(endDate))
      })
      .orderBy('createTime', 'desc')
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