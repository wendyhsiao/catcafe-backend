const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin/adminController.js')
const userController = require('../controllers/admin/userController.js')

router.get('/cafes', adminController.getCafes)
router.get('/cafes/:id/edit', adminController.getCafe)

router.post('/signup', userController.signUp)
router.post('/signin', userController.signIn)

module.exports = router
