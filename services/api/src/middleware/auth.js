import { config } from '../config.js'
import { verifyToken } from '../auth/token.js'

export function optionalAuth(req, _res, next) {
  const value = req.headers.authorization || ''
  const claims = value.startsWith('Bearer ') ? verifyToken(value.slice(7), config.tokenSecret) : null
  if (claims) req.auth = { id: claims.sub, role: claims.role }
  next()
}

export function requireUser(req, res, next) {
  if (!req.auth) return res.status(401).json({ ok: false, error: { code: 'UNAUTHENTICATED', message: '请先登录' } })
  next()
}

export function requireAdmin(req, res, next) {
  if (!req.auth) return res.status(401).json({ ok: false, error: { code: 'UNAUTHENTICATED', message: '请先登录' } })
  if (req.auth.role !== 'admin') return res.status(403).json({ ok: false, error: { code: 'FORBIDDEN', message: '仅队务管理员可操作' } })
  next()
}
