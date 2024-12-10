// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { date } = event

  try {
    // 查询当天的记录数量
    const result = await db.collection('goodThings')
      .where({
        _openid: wxContext.OPENID,
        date: date
      })
      .count()

    return {
      count: result.total
    }
  } catch (err) {
    console.error(err)
    return {
      count: 0,
      error: err
    }
  }
} 