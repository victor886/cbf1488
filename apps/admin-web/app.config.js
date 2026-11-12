const baseConfig = require('./app.json').expo

module.exports = ({ config }) => ({
  ...baseConfig,
  ...config,
  extra: {
    ...baseConfig.extra,
    ...config.extra,
    apiBase: process.env.EXPO_PUBLIC_API_BASE || ''
  }
})
