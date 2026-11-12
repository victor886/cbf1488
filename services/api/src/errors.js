export class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}

export function errorHandler(error, _req, res, _next) {
  const uploadError = error.code === 'LIMIT_FILE_SIZE' || error.code === 'LIMIT_UNEXPECTED_FILE'
  const statusCode = Number(error.statusCode) || (uploadError ? 413 : 500)
  if (statusCode >= 500) console.error(error)
  res.status(statusCode).json({
    ok: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: statusCode === 500 ? '服务暂时不可用，请稍后再试' : uploadError ? '文件过大或上传字段无效' : error.message
    }
  })
}
