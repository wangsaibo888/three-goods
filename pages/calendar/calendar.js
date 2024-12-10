Page({
  data: {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    dates: [],
    showRecords: false,
    selectedDate: '',
    dayRecords: []
  },

  onLoad: function() {
    this.generateCalendar()
  },

  // 生成日历数据
  generateCalendar: function() {
    const year = this.data.year
    const month = this.data.month
    const firstDay = new Date(year, month - 1, 1).getDay()
    const lastDate = new Date(year, month, 0).getDate()
    
    let dates = []
    let week = []
    
    // 填充上个月的日期
    const prevMonthLastDate = new Date(year, month - 1, 0).getDate()
    for (let i = firstDay - 1; i >= 0; i--) {
      week.push({
        date: prevMonthLastDate - i,
        current: false,
        fullDate: this.formatDate(year, month - 1, prevMonthLastDate - i)
      })
    }

    // 填充当前月的日期
    for (let i = 1; i <= lastDate; i++) {
      week.push({
        date: i,
        current: true,
        fullDate: this.formatDate(year, month, i)
      })
      
      if (week.length === 7) {
        dates.push(week)
        week = []
      }
    }

    // 填充下个月的日期
    if (week.length > 0) {
      const nextMonthDays = 7 - week.length
      for (let i = 1; i <= nextMonthDays; i++) {
        week.push({
          date: i,
          current: false,
          fullDate: this.formatDate(year, month + 1, i)
        })
      }
      dates.push(week)
    }

    this.setData({ dates })
    this.fetchMonthRecords()
  },

  // 格式化日期
  formatDate: function(year, month, day) {
    if (month <= 0) {
      year--
      month = 12
    } else if (month > 12) {
      year++
      month = 1
    }
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  },

  // 获取当月记录
  fetchMonthRecords: function() {
    const startDate = `${this.data.year}-${String(this.data.month).padStart(2, '0')}-01`
    const endDate = `${this.data.year}-${String(this.data.month).padStart(2, '0')}-31`

    wx.cloud.callFunction({
      name: 'getMonthRecords',
      data: {
        startDate,
        endDate
      },
      success: res => {
        const records = res.result.data
        let dates = this.data.dates
        
        // 更新日历数据，标记有记录的日期
        dates = dates.map(week => {
          return week.map(day => {
            const dayRecords = records.filter(r => r.date === day.fullDate)
            return {
              ...day,
              hasRecord: dayRecords.length > 0,
              moodLevel: this.getMoodLevel(dayRecords.length)
            }
          })
        })

        this.setData({ dates })
      }
    })
  },

  // 获取心情等级
  getMoodLevel: function(count) {
    const levels = {
      1: '好',
      2: '双',
      3: '三'
    }
    return levels[count] || ''
  },

  // 选择日期
  selectDate: function(e) {
    const date = e.currentTarget.dataset.date
    
    wx.cloud.callFunction({
      name: 'getDayRecords',
      data: { date },
      success: res => {
        this.setData({
          selectedDate: date,
          dayRecords: res.result.data,
          showRecords: true
        })
      }
    })
  },

  // 切换月份
  prevMonth: function() {
    let { year, month } = this.data
    if (month === 1) {
      year--
      month = 12
    } else {
      month--
    }
    this.setData({ year, month }, () => {
      this.generateCalendar()
    })
  },

  nextMonth: function() {
    let { year, month } = this.data
    if (month === 12) {
      year++
      month = 1
    } else {
      month++
    }
    this.setData({ year, month }, () => {
      this.generateCalendar()
    })
  },

  // 关闭弹窗
  closePopup: function() {
    this.setData({
      showRecords: false,
      dayRecords: []
    })
  },

  // 预览图片
  previewImage: function(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      urls: [url]
    })
  }
}) 