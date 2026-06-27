function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }

  let statusCode = err.statusCode || err.status || 500
  let message = err.message || 'Error interno del servidor'

  if (err.name === 'ValidationError' || err.type === 'validation') {
    statusCode = 400
    message = err.message || 'Error de validación'
  }

  if (
    err.name === 'UnauthorizedError' ||
    err.name === 'JsonWebTokenError' ||
    err.name === 'TokenExpiredError' ||
    statusCode === 401
  ) {
    statusCode = 401
    message = err.message || 'No autorizado'
  }

  const response = {
    error: true,
    message
  }

  if (err.errors) {
    response.errors = err.errors
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack
  }

  res.status(statusCode).json(response)
}

module.exports = errorHandler
