module.exports = app => {
  app.use('/api/cafes', require('./cafe.js'))
  app.use('/api/admin', require('./admin.js'))
}
