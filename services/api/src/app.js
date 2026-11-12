import express from 'express'
import { config } from './config.js'
import { optionalAuth } from './middleware/auth.js'
import { errorHandler, ApiError } from './errors.js'
import { createAuthRouter } from './routes/auth.js'
import { createMatchesRouter } from './routes/matches.js'
import { createPublicRouter } from './routes/public.js'
import { createAdminRouter } from './routes/admin.js'

export function createApp(repository) {
  const app = express()
  app.disable('x-powered-by')
  app.use((req, res, next) => {
    const origin = req.headers.origin
    if (!config.cloudbaseGateway && origin && (config.env !== 'production' || config.corsOrigins.includes(origin))) {
      res.setHeader('access-control-allow-origin', origin)
      res.setHeader('vary', 'Origin')
      res.setHeader('access-control-allow-headers', 'authorization,content-type')
      res.setHeader('access-control-allow-methods', 'GET,POST,PATCH,DELETE,OPTIONS')
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    next()
  })
  app.use(express.json({ limit: '2mb' }))
  if (config.storageDriver === 'local') app.use('/uploads', express.static(config.uploadDir, { fallthrough: false, index: false }))
  app.use(optionalAuth)

  app.get('/api/health', async (_req, res, next) => {
    try {
      await repository.healthCheck?.()
      res.json({ ok: true, data: { name: 'cbf1488-api', storage: config.storageDriver } })
    } catch (error) {
      next(error)
    }
  })
  app.use('/api/auth', createAuthRouter(repository))
  app.use('/api/matches', createMatchesRouter(repository))
  app.use('/api', createPublicRouter(repository))
  app.use('/api/admin', createAdminRouter(repository))
  app.use((_req, _res, next) => next(new ApiError(404, 'NOT_FOUND', '接口不存在')))
  app.use(errorHandler)
  return app
}
