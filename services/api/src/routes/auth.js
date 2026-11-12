import { Router } from 'express'
import { config } from '../config.js'
import { createToken } from '../auth/token.js'
import { requireUser } from '../middleware/auth.js'
import { ApiError } from '../errors.js'
import { route } from './helpers.js'

export function createAuthRouter(repository) {
  const router = Router()

  router.post('/dev-login', route(async (req, res) => {
    if (config.env === 'production') throw new ApiError(404, 'NOT_FOUND', '接口不存在')
    const role = req.body?.role === 'admin' ? 'admin' : 'member'
    const userId = role === 'admin' ? 'admin_001' : (req.body?.memberId || 'm_chen')
    const user = await repository.get('authUsers', userId)
    if (!user || user.role !== role) throw new ApiError(400, 'INVALID_DEMO_USER', '演示账号不存在')
    const member = user.memberId ? await repository.get('members', user.memberId) : null
    const token = createToken(user, config.tokenSecret)
    res.json({ ok: true, data: { token, user: { id: user.id, role: user.role, name: member?.name || user.name, avatar: member?.avatar || '' } } })
  }))

  router.post('/wechat', route(async (_req, _res) => {
    throw new ApiError(501, 'WECHAT_AUTH_NOT_CONFIGURED', '微信身份服务尚未配置')
  }))

  router.get('/me', requireUser, route(async (req, res) => {
    const user = await repository.get('authUsers', req.auth.id)
    if (!user) throw new ApiError(401, 'INVALID_SESSION', '登录已失效，请重新登录')
    const member = user.memberId ? await repository.get('members', user.memberId) : null
    res.json({ ok: true, data: { id: user.id, role: user.role, name: member?.name || user.name, avatar: member?.avatar || '' } })
  }))

  return router
}
