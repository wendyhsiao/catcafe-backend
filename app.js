const express = require('express')
const db = require('./models') // 引入資料庫
const app = express()
const port = 3000

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})

require('./routes')(app)
