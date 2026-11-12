import crypto from 'node:crypto'

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

export function createToken(user, secret, lifetimeSeconds = 60 * 60 * 24 * 7) {
  const now = Math.floor(Date.now() / 1000)
  const header = encode({ alg: 'HS256', typ: 'JWT' })
  const payload = encode({ sub: user.id, role: user.role, iat: now, exp: now + lifetimeSeconds })
  const data = `${header}.${payload}`
  const signature = crypto.createHmac('sha256', secret).update(data).digest('base64url')
  return `${data}.${signature}`
}

export function verifyToken(token, secret) {
  const [header, payload, signature] = String(token || '').split('.')
  if (!header || !payload || !signature) return null
  const data = `${header}.${payload}`
  const expected = crypto.createHmac('sha256', secret).update(data).digest()
  let actual
  try {
    actual = Buffer.from(signature, 'base64url')
  } catch {
    return null
  }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!claims.sub || claims.exp <= Math.floor(Date.now() / 1000)) return null
    return claims
  } catch {
    return null
  }
}
