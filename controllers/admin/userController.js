const bcrypt = require('bcryptjs')
const db = require('../../models')
const { AdminUser } = db
const passport = require('../../config/passport')

const userController = {
  signUp: async (req, res) => {
    try {
      const { name, email, password, password2 } = req.body
      // 確認所有項目都有填
      if (!name || !email || !password || !password2) {
        return res.json({ status: 'error', message: '所有都為必填項目！' })
      }
      // 確認密碼兩次輸入的一樣
      if (password !== password2) {
        return res.json({ status: 'error', message: '兩次密碼輸入不同！' })
      }
      // 確認 email 格式
      const regexp = / ^ ([\w\.\-]){1,64} \@ ([\w\.\-]){1,64} $ /
      if (!email.match(regexp)) {
        return res.json({ status: 'error', message: '此 email 格式無效！' })
      }
      // 確認 email 是否註冊過
      const isExist = await AdminUser.findOne({ where: { email } })
      if (isExist) {
        return res.json({ status: 'error', message: '此 email 已註冊過！' })
      }

      await AdminUser.create({
        name,
        email,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10))
      })

      return res.json({ status: 'success', message: '成功註冊帳號！' })
    } catch (error) {
      console.error(error)
    }
  },
  signIn: (req, res, next) => {
    try {
      passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err) }
        if (!user) { return res.json({ status: 'error', message: '帳號或密碼錯誤' }) }
        req.logIn(user, (err) => {
          if (err) { return next(err) }
          return res.json({ status: 'success', message: `${user.email} 成功登入帳號！` })
        })
      })(req, res, next)
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = userController
