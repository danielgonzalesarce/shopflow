const express = require('express')
const authController = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const {
  validateRequest,
  registerValidator,
  loginValidator
} = require('../middlewares/validate.middleware')

const router = express.Router()

router.post('/register', registerValidator, validateRequest, authController.register)
router.post('/login', loginValidator, validateRequest, authController.login)
router.get('/me', authMiddleware, authController.getMe)

module.exports = router
