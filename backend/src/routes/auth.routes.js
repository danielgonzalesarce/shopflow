const express = require('express')
const authController = require('../controllers/auth.controller')
const oauthController = require('../controllers/oauth.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const {
  validateRequest,
  registerValidator,
  loginValidator
} = require('../middlewares/validate.middleware')

const router = express.Router()

router.get('/oauth/status', oauthController.oauthStatus)
router.get('/google', oauthController.startGoogle)
router.get('/google/callback', oauthController.googleCallback)
router.get('/github', oauthController.startGitHub)
router.get('/github/callback', oauthController.githubCallback)

router.post('/register', registerValidator, validateRequest, authController.register)
router.post('/login', loginValidator, validateRequest, authController.login)
router.get('/me', authMiddleware, authController.getMe)

module.exports = router
