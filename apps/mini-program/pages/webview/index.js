Page({
  data: {
    src: ''
  },
  onLoad(options) {
    const app = getApp()
    const developmentUrl = options.dev === '1' ? 'http://localhost:8081/?surface=mini' : ''
    this.setData({ src: developmentUrl || app.globalData.h5Url })
  },
  onMessage(event) {
    const payload = event.detail?.data?.slice(-1)[0]
    if (payload?.type === 'toast' && payload.message) {
      wx.showToast({ title: String(payload.message).slice(0, 16), icon: 'none' })
    }
  },
  onError() {
    wx.showToast({ title: '页面暂时无法打开', icon: 'none' })
  }
})
