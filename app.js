const express = require('express')
const bodyParser = require('body-parser')
const passport = require('./config/passport.js')
const db = require('./models') // 引入資料庫
const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(passport.initialize())
app.use(passport.session())

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})

require('./routes')(app)
