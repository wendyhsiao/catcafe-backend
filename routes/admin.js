const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin/adminController.js')
const userController = require('../controllers/admin/userController.js')
const passport = require('../config/passport')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const authenticated = passport.authenticate('jwt', { session: false })

router.get('/cafes', authenticated, adminController.getCafes)
router.get('/cafes/:id/edit', authenticated, adminController.getCafe)
router.post('/cafes', authenticated, upload.array('image', 12), adminController.postCafe)
router.put('/cafes/:id', authenticated, upload.array('image', 12), adminController.putCafe)
router.delete('/cafes/:id', authenticated, adminController.deleteCafe)

router.post('/signup', userController.signUp)
router.post('/signin', userController.signIn)

module.exports = router
