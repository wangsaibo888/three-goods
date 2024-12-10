const app = getApp()

Page({
  data: {
    content: '',
    imageUrl: '',
    todayCount: 0
  },

  onLoad: function() {
    this.checkTodayRecords()
  },

  // 检查今日记录数
  checkTodayRecords: function() {
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`

    wx.cloud.callFunction({
      name: 'getTodayRecords',
      data: { date: dateStr },
      success: res => {
        const count = res.result.count
        if (count >= 3) {
          wx.showToast({
            title: '今日已达到记录上限',
            icon: 'none',
            success: () => {
              setTimeout(() => {
                wx.switchTab({
                  url: '/pages/index/index'
                })
              }, 1500)
            }
          })
        }
        this.setData({ todayCount: count })
      }
    })
  },

  // 内容输入处理
  onContentInput: function(e) {
    this.setData({
      content: e.detail.value
    })
  },

  // 选择图片
  chooseImage: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // 压缩图片
        this.compressImage(res.tempFilePaths[0])
      }
    })
  },

  // 压缩图片
  compressImage: function(tempFilePath) {
    wx.compressImage({
      src: tempFilePath,
      quality: 80,
      success: res => {
        this.setData({
          imageUrl: res.tempFilePath
        })
      }
    })
  },

  // 删除图片
  deleteImage: function() {
    this.setData({
      imageUrl: ''
    })
  },

  // 提交记录
  submitRecord: function() {
    if (!this.data.content.trim()) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '保存中...'
    })

    // 先上传图片（如果有）
    const uploadTask = this.data.imageUrl ? this.uploadImage() : Promise.resolve(null)

    uploadTask.then(fileID => {
      // 保存记录到数据库
      return wx.cloud.callFunction({
        name: 'addRecord',
        data: {
          content: this.data.content,
          imageUrl: fileID,
          createTime: new Date(),
          date: new Date().toISOString().split('T')[0]
        }
      })
    }).then(() => {
      wx.hideLoading()
      wx.showToast({
        title: '记录成功',
        success: () => {
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/index/index'
            })
          }, 1500)
        }
      })
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      })
      console.error(err)
    })
  },

  // 上传图片到云存储
  uploadImage: function() {
    const cloudPath = `${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`
    return wx.cloud.uploadFile({
      cloudPath,
      filePath: this.data.imageUrl
    }).then(res => res.fileID)
  }
}) 