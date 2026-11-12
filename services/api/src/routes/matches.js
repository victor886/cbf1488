import { Router } from 'express'
import { requireUser } from '../middleware/auth.js'
import { ApiError } from '../errors.js'
import { memberById, notFound, route, serializeMatch } from './helpers.js'

export function createMatchesRouter(repository) {
  const router = Router()

  router.get('/', route(async (req, res) => {
    const status = req.query.status || 'all'
    const allowed = new Set(['all', 'upcoming', 'live', 'completed'])
    if (!allowed.has(status)) throw new ApiError(400, 'INVALID_FILTER', '比赛状态筛选无效')
    const [matches, members] = await Promise.all([repository.list('matches'), repository.list('members')])
    const priority = { upcoming: 0, live: 1, completed: 2 }
    const filtered = matches
      .filter(match => status === 'all' || match.status === status)
      .sort((a, b) => {
        const byStatus = (priority[a.status] ?? 9) - (priority[b.status] ?? 9)
        if (byStatus) return byStatus
        return a.status === 'completed' ? new Date(b.startAt) - new Date(a.startAt) : new Date(a.startAt) - new Date(b.startAt)
      })
    res.json({ ok: true, data: filtered.map(match => serializeMatch(match, members, req.auth?.id)) })
  }))

  router.get('/:matchId', route(async (req, res) => {
    const [match, members] = await Promise.all([
      repository.get('matches', req.params.matchId),
      repository.list('members')
    ])
    if (!match) throw notFound('比赛')
    res.json({ ok: true, data: serializeMatch(match, members, req.auth?.id) })
  }))

  router.post('/:matchId/signups', requireUser, route(async (req, res) => {
    if (req.auth.role !== 'member') throw new ApiError(403, 'MEMBER_ONLY', '管理员账号不能报名')
    const member = await memberById(repository, req.auth.id)
    const updated = await repository.mutate('matches', req.params.matchId, match => {
      if (match.status !== 'upcoming') throw new ApiError(409, 'SIGNUP_CLOSED', '这场比赛已停止报名')
      if (new Date(match.signupDeadline).getTime() <= Date.now()) throw new ApiError(409, 'SIGNUP_CLOSED', '报名已截止')
      if (match.signups.some(item => item.memberId === member.id)) throw new ApiError(409, 'ALREADY_SIGNED_UP', '你已经报名了')
      if (match.signups.length >= match.maxPlayers) throw new ApiError(409, 'MATCH_FULL', '名额已满')
      match.signups.push({ memberId: member.id, signedAt: new Date().toISOString() })
      return match
    })
    if (!updated) throw notFound('比赛')
    const members = await repository.list('members')
    res.status(201).json({ ok: true, data: serializeMatch(updated, members, member.id) })
  }))

  router.delete('/:matchId/signups/me', requireUser, route(async (req, res) => {
    if (req.auth.role !== 'member') throw new ApiError(403, 'MEMBER_ONLY', '管理员账号没有队员报名')
    const updated = await repository.mutate('matches', req.params.matchId, match => {
      if (match.status !== 'upcoming') throw new ApiError(409, 'CANCEL_CLOSED', '比赛开始后不能取消报名')
      if (new Date(match.signupDeadline).getTime() <= Date.now()) throw new ApiError(409, 'CANCEL_CLOSED', '报名截止后不能取消报名')
      const before = match.signups.length
      match.signups = match.signups.filter(item => item.memberId !== req.auth.id)
      if (before === match.signups.length) throw new ApiError(409, 'NOT_SIGNED_UP', '当前没有这场比赛的报名记录')
      return match
    })
    if (!updated) throw notFound('比赛')
    const members = await repository.list('members')
    res.json({ ok: true, data: serializeMatch(updated, members, req.auth.id) })
  }))

  return router
}
