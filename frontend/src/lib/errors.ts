import axios from 'axios'

export function getApiErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado') {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string') return message
  }

  if (error instanceof Error) return error.message

  return fallback
}
