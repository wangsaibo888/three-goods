Page({
  data: {
    groupedRecords: [],
    pageSize: 20,
    currentPage: 1,
    isLoading: false,
    noMore: false
  },

  onLoad: function() {
    this.loadRecords()
  },

  onPullDownRefresh: function() {
    this.setData({
      groupedRecords: [],
      currentPage: 1,
      noMore: false
    }, () => {
      this.loadRecords().then(() => {
        wx.stopPullDownRefresh()
      })
    })
  },

  // 加载记录
  loadRecords: function() {
    if (this.data.isLoading || this.data.noMore) return

    this.setData({ isLoading: true })

    return wx.cloud.callFunction({
      name: 'getRecordsList',
      data: {
        page: this.data.currentPage,
        pageSize: this.data.pageSize
      }
    }).then(res => {
      const records = res.result.data
      
      if (records.length < this.data.pageSize) {
        this.setData({ noMore: true })
      }

      // 处理数据，按日期分组
      const newGroupedRecords = this.groupRecordsByDate(records)
      
      this.setData({
        groupedRecords: [...this.data.groupedRecords, ...newGroupedRecords],
        currentPage: this.data.currentPage + 1,
        isLoading: false
      })
    }).catch(err => {
      console.error('加载记录失败：', err)
      this.setData({ isLoading: false })
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      })
    })
  },

  // 按日期分组记录
  groupRecordsByDate: function(records) {
    const groups = {}
    
    records.forEach(record => {
      const date = record.date
      if (!groups[date]) {
        groups[date] = {
          date: date,
          records: [],
          moodLevel: ''
        }
      }
      
      // 格式化时间
      record.createTime = this.formatTime(record.createTime)
      groups[date].records.push(record)
      
      // 更新心情等级
      groups[date].moodLevel = this.getMoodLevel(groups[date].records.length)
    })

    return Object.values(groups)
  },

  // 格式化时间
  formatTime: function(date) {
    date = new Date(date)
    const hour = date.getHours()
    const minute = date.getMinutes()
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  },

  // 获取心情等级
  getMoodLevel: function(count) {
    const levels = {
      1: '好心情',
      2: '双喜临门',
      3: '三重喜事'
    }
    return levels[count] || ''
  },

  // 加载更多
  loadMore: function() {
    this.loadRecords()
  },

  // 预览图片
  previewImage: function(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      urls: [url]
    })
  }
}) 