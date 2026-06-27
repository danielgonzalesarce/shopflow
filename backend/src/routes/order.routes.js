const express = require('express')
const orderController = require('../controllers/order.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const requireRole = require('../middlewares/role.middleware')

const router = express.Router()

router.use(authMiddleware)

router.get('/', orderController.getMyOrders)
router.get('/admin/all', requireRole('admin'), orderController.getAllOrders)
router.get('/:id', orderController.getOrderById)
router.post('/', orderController.createOrder)
router.put('/:id/status', requireRole('admin'), orderController.updateOrderStatus)

module.exports = router
