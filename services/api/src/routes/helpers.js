import crypto from 'node:crypto'
import { ApiError } from '../errors.js'

export const route = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
export const id = prefix => `${prefix}_${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`
export const notFound = (kind = '内容') => new ApiError(404, 'NOT_FOUND', `${kind}不存在`)

export async function memberById(repository, memberId) {
  const member = await repository.get('members', memberId)
  if (!member) throw notFound('队员')
  return member
}

export function serializeMatch(match, members, memberId) {
  const membersById = new Map(members.map(member => [member.id, member]))
  const signups = (match.signups || []).map(item => {
    const member = membersById.get(item.memberId)
    return {
      memberId: item.memberId,
      name: member?.name || item.memberName || '队员',
      initial: (member?.name || item.memberName || '队员').slice(0, 1),
      number: member?.number || '',
      avatar: member?.avatar || '',
      signedAt: item.signedAt
    }
  })
  return {
    ...match,
    signups,
    registeredCount: signups.length,
    isSignedUp: Boolean(memberId && signups.some(item => item.memberId === memberId)),
    result: match.result?.published ? match.result : { published: false, teams: [] }
  }
}
