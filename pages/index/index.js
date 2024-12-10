const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    moodLevel: '未记录',
    todayCount: 0
  },

  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }
    this.checkTodayRecords()
  },

  onShow: function () {
    // 每次显示页面时检查今日记录
    this.checkTodayRecords()
  },

  getUserInfo: function(e) {
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      app.globalData.hasUserInfo = true
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
    }
  },

  checkTodayRecords: function() {
    // 获取当天的日期
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`

    // 调用云函数获取今日记录数
    wx.cloud.callFunction({
      name: 'getTodayRecords',
      data: {
        date: dateStr
      },
      success: res => {
        const count = res.result.count
        this.setData({
          todayCount: count,
          moodLevel: this.getMoodLevel(count)
        })
      }
    })
  },

  getMoodLevel: function(count) {
    const levels = {
      0: '未记录',
      1: '好心情',
      2: '双喜临门',
      3: '三重喜事'
    }
    return levels[count] || levels[0]
  },

  goToRecord: function() {
    if (this.data.todayCount >= 3) {
      wx.showToast({
        title: '今日已达到记录上限',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/record/record'
    })
  }
}) 