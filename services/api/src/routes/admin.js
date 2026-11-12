import { Router } from 'express'
import fs from 'node:fs/promises'
import crypto from 'node:crypto'
import multer from 'multer'
import { requireAdmin } from '../middleware/auth.js'
import { config } from '../config.js'
import { ApiError } from '../errors.js'
import { id, notFound, route } from './helpers.js'

const validDate = value => typeof value === 'string' && Number.isFinite(new Date(value).getTime())

export function createAdminRouter(repository) {
  const router = Router()
  router.use(requireAdmin)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 24 * 1024 * 1024, files: 1 },
    fileFilter(_req, file, done) {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime']
      done(allowed.includes(file.mimetype) ? null : new ApiError(400, 'UNSUPPORTED_FILE', '仅支持 JPG、PNG、WebP 图片和 MP4 视频'), allowed.includes(file.mimetype))
    }
  })

  router.post('/uploads', upload.single('file'), route(async (req, res) => {
    if (config.storageDriver !== 'local') throw new ApiError(501, 'CLOUD_UPLOAD_NOT_CONFIGURED', '生产媒体上传需先配置腾讯云对象存储')
    if (!req.file) throw new ApiError(400, 'MISSING_FILE', '请选择要上传的文件')
    const extensions = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'video/mp4': '.mp4', 'video/quicktime': '.mov' }
    const filename = `${crypto.randomUUID()}${extensions[req.file.mimetype]}`
    await fs.mkdir(config.uploadDir, { recursive: true })
    await fs.writeFile(`${config.uploadDir}/${filename}`, req.file.buffer, { flag: 'wx' })
    res.status(201).json({ ok: true, data: { url: `/uploads/${filename}`, type: req.file.mimetype.startsWith('video/') ? 'video' : 'image', size: req.file.size } })
  }))

  router.get('/dashboard', route(async (_req, res) => {
    const [members, matches, charges] = await Promise.all([repository.list('members'), repository.list('matches'), repository.list('charges')])
    const memberNames = new Map(members.map(member => [member.id, member.name]))
    res.json({ ok: true, data: {
      memberCount: members.length,
      upcomingMatches: matches.filter(match => match.status === 'upcoming').length,
      liveMatches: matches.filter(match => match.status === 'live').length,
      recentMatches: matches.filter(match => match.status !== 'completed').sort((a, b) => new Date(a.startAt) - new Date(b.startAt)).slice(0, 5),
      recentCharges: charges.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map(charge => ({ ...charge, memberName: memberNames.get(charge.memberId) || '队员' }))
    } })
  }))

  router.post('/matches', route(async (req, res) => {
    const { title, startAt, endAt, signupDeadline, location, maxPlayers, description = '', coverUrl = '', images = [], videoUrl = '', tags = [] } = req.body || {}
    if (!title?.trim() || !validDate(startAt) || !validDate(endAt) || !validDate(signupDeadline) || !location?.trim() || !Number.isInteger(Number(maxPlayers)) || Number(maxPlayers) < 2) {
      throw new ApiError(400, 'INVALID_MATCH', '请填写比赛名称、时间、地点和有效人数')
    }
    if (new Date(endAt) <= new Date(startAt)) throw new ApiError(400, 'INVALID_MATCH_TIME', '结束时间必须晚于开始时间')
    if (new Date(signupDeadline) > new Date(startAt)) throw new ApiError(400, 'INVALID_SIGNUP_DEADLINE', '报名截止时间不能晚于比赛开始时间')
    const match = {
      id: id('match'), title: title.trim(), status: 'upcoming', startAt, endAt, signupDeadline,
      location: location.trim(), maxPlayers: Number(maxPlayers), description: String(description).trim(),
      tags: Array.isArray(tags) ? tags.slice(0, 8).map(tag => String(tag).trim()).filter(Boolean) : [],
      coverUrl: String(coverUrl), images: Array.isArray(images) ? images.slice(0, 9) : [], videoUrl: String(videoUrl),
      signups: [], result: { published: false, teams: [] }, createdAt: new Date().toISOString()
    }
    await repository.insert('matches', match)
    res.status(201).json({ ok: true, data: match })
  }))

  router.patch('/members/:memberId', route(async (req, res) => {
    const allowed = ['name', 'number', 'position', 'phone', 'bio', 'avatar', 'videoUrl', 'balance']
    const changes = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)))
    if (!Object.keys(changes).length) throw new ApiError(400, 'EMPTY_UPDATE', '没有可保存的资料')
    if (changes.name !== undefined && !String(changes.name).trim()) throw new ApiError(400, 'INVALID_NAME', '队员姓名不能为空')
    if (changes.name !== undefined) changes.name = String(changes.name).trim()
    if (changes.balance !== undefined) {
      changes.balance = Number(changes.balance)
      if (!Number.isFinite(changes.balance) || changes.balance < 0) throw new ApiError(400, 'INVALID_BALANCE', '账户余额不能小于 0')
    }
    const updated = await repository.mutate('members', req.params.memberId, member => ({ ...member, ...changes, updatedAt: new Date().toISOString() }))
    if (!updated) throw notFound('队员')
    res.json({ ok: true, data: updated })
  }))

  router.get('/charges', route(async (req, res) => {
    const [charges, members] = await Promise.all([repository.list('charges'), repository.list('members')])
    const memberMap = new Map(members.map(member => [member.id, member]))
    const filtered = charges
      .filter(charge => !req.query.memberId || charge.memberId === req.query.memberId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(charge => ({ ...charge, memberName: memberMap.get(charge.memberId)?.name || '队员' }))
    res.json({ ok: true, data: filtered })
  }))

  router.post('/charges', route(async (req, res) => {
    const { memberId, amount, date, note = '' } = req.body || {}
    const number = Number(amount)
    if (!memberId || !Number.isFinite(number) || number <= 0 || !validDate(date)) throw new ApiError(400, 'INVALID_CHARGE', '请选择队员并填写有效金额和日期')
    const member = await repository.get('members', memberId)
    if (!member) throw notFound('队员')
    const charge = { id: id('charge'), memberId, amount: number, date: new Date(date).toISOString().slice(0, 10), note: String(note).trim(), createdAt: new Date().toISOString() }
    await repository.mutate('members', memberId, current => ({ ...current, balance: Number(current.balance || 0) + number }))
    await repository.insert('charges', charge)
    res.status(201).json({ ok: true, data: { ...charge, memberName: member.name } })
  }))

  return router
}
