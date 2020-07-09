const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const db = require('../models')
const { AdminUser } = db

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await AdminUser.findOne({ raw: true, where: { email } })
      if (!user) { return done(null, false) }
      if (!bcrypt.compareSync(password, user.password)) { return done(null, false) }
      return done(null, user)
    } catch (error) {
      console.error(error)
      return done(error)
    }
  }
))

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  AdminUser.findById(id, (err, user) => {
    done(err, user)
  })
})

module.exports = passport
