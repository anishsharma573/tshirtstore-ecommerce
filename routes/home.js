const express = require('express')
const { home,homeDummy } = require('../controller/homecontroller')
const router = express.Router()




router.route('/').get(home)
router.route('/dummy').get(homeDummy)




module.exports=router