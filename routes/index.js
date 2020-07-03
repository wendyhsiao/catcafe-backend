module.exports = app => {
  app.use('/api/cafes', require('./cafe.js'))
}
