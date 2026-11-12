import { Router } from 'express'
import { requireUser } from '../middleware/auth.js'
import { ApiError } from '../errors.js'
import { memberById, route } from './helpers.js'

export function createPublicRouter(repository) {
  const router = Router()
  const publicMemberFields = member => ({
    id: member.id,
    name: member.name,
    number: member.number,
    position: member.position,
    avatar: member.avatar || '',
    bio: member.bio || '',
    videoUrl: member.videoUrl || '',
    scoreAvg: Number(member.scoreAvg || 0),
    reboundAvg: Number(member.reboundAvg || 0),
    honors: Number(member.honors || 0)
  })

  router.get('/members', route(async (req, res) => {
    const keyword = String(req.query.q || '').trim().toLocaleLowerCase()
    const [members, matches] = await Promise.all([repository.list('members'), repository.list('matches')])
    const completed = matches.filter(match => match.status === 'completed')
    const data = members
      .filter(member => !keyword || `${member.name} ${member.number} ${member.position}`.toLocaleLowerCase().includes(keyword))
      .map(member => ({
        ...publicMemberFields(member),
        ...(req.auth?.role === 'admin' ? { balance: Number(member.balance || 0) } : {}),
        attendance: completed.filter(match => match.signups.some(item => item.memberId === member.id)).length,
        games: matches.filter(match => match.signups.some(item => item.memberId === member.id)).length
      }))
      .sort((a, b) => Number(a.number || 999) - Number(b.number || 999))
    res.json({ ok: true, data })
  }))

  router.get('/members/:memberId', route(async (req, res) => {
    const [member, matches, charges] = await Promise.all([
      repository.get('members', req.params.memberId),
      repository.list('matches'),
      repository.list('charges')
    ])
    if (!member) throw new ApiError(404, 'NOT_FOUND', '队员不存在')
    const participation = matches.filter(match => match.signups.some(item => item.memberId === member.id))
    const completedMatches = participation.filter(match => match.status === 'completed')
    const nowParts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit' }).formatToParts(new Date())
    const year = Number(nowParts.find(part => part.type === 'year').value)
    const month = Number(nowParts.find(part => part.type === 'month').value)
    const monthStart = new Date(String(year) + '-' + String(month).padStart(2, '0') + '-01T00:00:00+08:00')
    const nextMonthStart = new Date(month === 12 ? String(year + 1) + '-01-01T00:00:00+08:00' : String(year) + '-' + String(month + 1).padStart(2, '0') + '-01T00:00:00+08:00')
    const seasonYear = month >= 3 && month <= 8 ? year : month >= 9 ? year : year - 1
    const seasonStartMonth = month >= 3 && month <= 8 ? '03' : '09'
    const seasonStart = new Date(String(seasonYear) + '-' + seasonStartMonth + '-01T00:00:00+08:00')
    const seasonEnd = new Date((month >= 3 && month <= 8 ? seasonYear : seasonYear + 1) + '-' + (seasonStartMonth === '03' ? '09' : '03') + '-01T00:00:00+08:00')
    const attendanceStats = {
      month: completedMatches.filter(match => new Date(match.startAt) >= monthStart && new Date(match.startAt) < nextMonthStart).length,
      season: completedMatches.filter(match => new Date(match.startAt) >= seasonStart && new Date(match.startAt) < seasonEnd).length,
      total: completedMatches.length
    }
    const privateAccess = req.auth?.role === 'admin' || req.auth?.id === member.id
    res.json({ ok: true, data: {
      ...publicMemberFields(member),
      attendance: completedMatches.length,
      attendanceStats,
      games: participation.length,
      ...(privateAccess ? { phone: member.phone || '', joinedAt: member.joinedAt, balance: Number(member.balance || 0), spentAmount: Number(member.spentAmount || 0) } : {}),
      upcomingMatches: participation.filter(match => match.status !== 'completed').map(match => ({ id: match.id, title: match.title, startAt: match.startAt, status: match.status })),
      completedMatches: completedMatches.sort((a, b) => b.startAt.localeCompare(a.startAt)),
      ...(privateAccess ? { charges: charges.filter(item => item.memberId === member.id).sort((a, b) => b.date.localeCompare(a.date)) } : {})
    } })
  }))

  router.get('/leaderboard', route(async (req, res) => {
    const period = req.query.period || 'season'
    const now = new Date()
    const nowParts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit' }).formatToParts(now)
    const currentYear = Number(nowParts.find(part => part.type === 'year').value)
    const currentMonth = Number(nowParts.find(part => part.type === 'month').value)
    const currentSeason = currentMonth >= 3 && currentMonth <= 8
      ? `${currentYear}-spring`
      : `${currentMonth <= 2 ? currentYear - 1 : currentYear}-fall`
    const season = String(req.query.season || currentSeason)
    if (!['month', 'season', 'all'].includes(period)) throw new ApiError(400, 'INVALID_PERIOD', '出勤统计范围无效')
    const matches = (await repository.list('matches')).filter(match => match.status === 'completed')
    const selected = matches.filter(match => {
      const date = new Date(match.startAt)
      const matchParts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit' }).formatToParts(date)
      const matchYear = Number(matchParts.find(part => part.type === 'year').value)
      const matchMonth = Number(matchParts.find(part => part.type === 'month').value)
      if (period === 'month') return matchYear === currentYear && matchMonth === currentMonth
      if (season !== 'all') {
        const parsed = season.match(/^(\d{4})-(spring|fall)$/)
        if (parsed) {
          const year = Number(parsed[1])
          const isSpring = parsed[2] === 'spring'
          const start = new Date(`${year}-${isSpring ? '03' : '09'}-01T00:00:00+08:00`)
          const end = new Date(`${isSpring ? year : year + 1}-${isSpring ? '09' : '03'}-01T00:00:00+08:00`)
          if (date < start || date >= end) return false
        }
      }
      return true
    })
    const counts = new Map()
    for (const match of selected) for (const signup of match.signups) counts.set(signup.memberId, (counts.get(signup.memberId) || 0) + 1)
    const members = await repository.list('members')
    const rows = members.map(member => ({ ...publicMemberFields(member), attendance: counts.get(member.id) || 0 }))
      .sort((a, b) => b.attendance - a.attendance || a.name.localeCompare(b.name, 'zh-CN'))
      .map((member, index) => ({ ...member, rank: index + 1 }))
    res.json({ ok: true, data: { period, completedMatches: selected.length, members: rows } })
  }))

  router.get('/me/profile', requireUser, route(async (req, res) => {
    if (req.auth.role !== 'member') throw new ApiError(403, 'MEMBER_ONLY', '管理员没有队员资料')
    const [member, matches, charges] = await Promise.all([
      memberById(repository, req.auth.id), repository.list('matches'), repository.list('charges')
    ])
    const participation = matches.filter(match => match.signups.some(item => item.memberId === member.id))
    res.json({ ok: true, data: {
      member,
      attendance: participation.filter(match => match.status === 'completed').length,
      balance: Number(member.balance || 0),
      spentAmount: Number(member.spentAmount || 0),
      honors: Number(member.honors || 0),
      upcomingMatches: participation.filter(match => match.status !== 'completed'),
      completedMatches: participation.filter(match => match.status === 'completed').sort((a, b) => b.startAt.localeCompare(a.startAt)),
      charges: charges.filter(item => item.memberId === member.id).sort((a, b) => b.date.localeCompare(a.date))
    } })
  }))

  router.get('/matches/:matchId/results', route(async (req, res) => {
    const match = await repository.get('matches', req.params.matchId)
    if (!match) throw new ApiError(404, 'NOT_FOUND', '比赛不存在')
    if (!match.result?.published) return res.json({ ok: true, data: { published: false, teams: [] } })
    const members = await repository.list('members')
    const membersById = new Map(members.map(member => [member.id, member]))
    const teams = (match.result.teams || []).map(team => ({
      ...team,
      players: (team.players || []).map(player => {
        const member = membersById.get(player.memberId)
        return { ...player, name: member?.name || '队员', avatar: member?.avatar || '', number: member?.number || '' }
      })
    }))
    res.json({ ok: true, data: { ...match.result, teams } })
  }))

  return router
}
