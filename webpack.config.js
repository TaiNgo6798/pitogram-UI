const isDev = process.env.NODE_ENV === 'development'
const { _default } = require('./config/default.config')

module.exports = _default(isDev, process.env)
