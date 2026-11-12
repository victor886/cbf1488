const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/$/, '')
const TOKEN_KEY = 'cbf1488.admin.token'

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY)
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: {
      ...(options.body instanceof FormData ? {} : { 'content-type': 'application/json' }),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.ok === false) throw new Error(payload.error?.message || `请求失败（${response.status}）`)
  return payload.data
}

export const api = {
  request,
  loginDemo: () => request('/auth/dev-login', { method: 'POST', body: { role: 'admin' } }),
  me: () => request('/auth/me'),
  dashboard: () => request('/admin/dashboard'),
  matches: (status = 'all') => request(`/matches?status=${encodeURIComponent(status)}`),
  members: (q = '') => request(`/members?q=${encodeURIComponent(q)}`),
  member: id => request(`/members/${encodeURIComponent(id)}`),
  saveMember: (id, body) => request(`/admin/members/${encodeURIComponent(id)}`, { method: 'PATCH', body }),
  createMatch: body => request('/admin/matches', { method: 'POST', body }),
  charges: () => request('/admin/charges'),
  createCharge: body => request('/admin/charges', { method: 'POST', body }),
  upload: file => { const body = new FormData(); body.append('file', file); return request('/admin/uploads', { method: 'POST', body }) }
}

export { TOKEN_KEY }
