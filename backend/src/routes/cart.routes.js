const express = require('express')
const cartController = require('../controllers/cart.controller')
const authMiddleware = require('../middlewares/auth.middleware')

const router = express.Router()

router.use(authMiddleware)

router.get('/', cartController.getCart)
router.post('/', cartController.addItem)
router.put('/:id', cartController.updateItem)
router.delete('/', cartController.clearCart)
router.delete('/:id', cartController.removeItem)

module.exports = router
