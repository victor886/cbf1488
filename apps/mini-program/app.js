const DEFAULT_H5_URL = 'https://www.cbf1488.com/?surface=mini'

App({
  globalData: {
    h5Url: DEFAULT_H5_URL,
    demoMode: true
  },
  onLaunch() {
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#0b1531',
      animation: { duration: 0, timingFunc: 'linear' }
    })
  }
})
