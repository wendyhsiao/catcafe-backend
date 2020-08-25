const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
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
  signIn: async (req, res) => {
    try {
      // 確認帳號密碼都有填
      if (!req.body.email || !req.body.password) {
        return res.json({ status: 'error', message: '請輸入帳號及密碼' })
      }
      // 確認帳號是否存在
      const user = await AdminUser.findOne({ where: { email: req.body.email }})
      if (!user) {
        return res.status(401).json({ status: 'error', message: '找不到此帳號' })
      }
      // 確認密碼是否正確
      if (!bcrypt.compareSync(req.body.password, user.password)) {
        return res.status(401).json({ status: 'error', message: '密碼錯誤' })
      }

      // 簽發 token
      const payload = { id: user.id }
      const token = jwt.sign(payload, process.env.JWT_SECRET)

      return res.json({
        status: 'success',
        message: 'ok',
        token: token,
        user: {
          id: user.id, name: user.name, email: user.email
        }
      })
    } catch (error) {
      console.error(error)
    }
  },
  getCurrentUser: async (req, res) => {
    return res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    })
  }
}

module.exports = userController
