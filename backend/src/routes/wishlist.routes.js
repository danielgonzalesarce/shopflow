const express = require('express')
const wishlistController = require('../controllers/wishlist.controller')
const authMiddleware = require('../middlewares/auth.middleware')

const router = express.Router()

router.use(authMiddleware)

router.get('/', wishlistController.getWishlist)
router.post('/', wishlistController.addItem)
router.post('/toggle/:product_id', wishlistController.toggleItem)
router.delete('/:product_id', wishlistController.removeItem)

module.exports = router
