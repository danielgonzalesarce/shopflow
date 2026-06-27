const { body, validationResult } = require('express-validator')

function validateRequest(req, res, next) {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: true,
      message: 'Errores de validación en la solicitud',
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg
      }))
    })
  }

  next()
}

const registerValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('El nombre completo es obligatorio')
]

const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
]

const productValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del producto es obligatorio'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un entero no negativo')
]

module.exports = {
  validateRequest,
  registerValidator,
  loginValidator,
  productValidator
}
