const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const db = require('../models')
const { AdminUser } = db
require('dotenv').config()

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

// JWT
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = process.env.JWT_SECRET

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    const user = await AdminUser.findByPk(jwt_payload.id)
    if (!user) { return done(null, false) }
    return done(null, user)
  } catch (error) {
    console.error(error)
    return done(error, false)
  }
}))

module.exports = passport
