const express = require('express')
const router = express.Router()
const cafeController = require('../controllers/cafeController.js')

router.get('/', cafeController.getCafes)
router.get('/:id', cafeController.getCafe)

module.exports = router
