const express = require('express')
const multer = require('multer')
const productController = require('../controllers/product.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const requireRole = require('../middlewares/role.middleware')
const {
  validateRequest,
  productValidator
} = require('../middlewares/validate.middleware')

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get('/', productController.getAll)
router.get('/categories', productController.getCategories)
router.get(
  '/admin/all',
  authMiddleware,
  requireRole('admin'),
  productController.getAllAdmin
)
router.get('/:id', productController.getById)

router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  upload.single('image'),
  productValidator,
  validateRequest,
  productController.create
)

router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  upload.single('image'),
  productController.update
)

router.delete(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  productController.delete
)

module.exports = router
