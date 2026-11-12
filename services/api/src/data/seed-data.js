const avatars = [
  '/static/avatars/member-chen.png',
  '/static/avatars/member-lin.png',
  '/static/avatars/member-zhou.png',
  '/static/avatars/member-xu.png'
]
const courtImage = '/static/covers/basketball-hoop.png'

export const seedData = {
  members: [
    { id: 'm_chen', name: '陈宇', number: '07', position: '后卫', avatar: avatars[0], phone: '13800008888', joinedAt: '2024-03-12', bio: '控场后卫，习惯用传球带动节奏。', videoUrl: '', scoreAvg: 15, reboundAvg: 3.6, balance: 360, spentAmount: 360, honors: 3 },
    { id: 'm_lin', name: '林楠', number: '11', position: '前锋', avatar: avatars[1], phone: '13800001111', joinedAt: '2023-05-08', bio: '擅长侧翼防守和快攻推进。', videoUrl: '', scoreAvg: 16.8, reboundAvg: 4.2, balance: 520, spentAmount: 500, honors: 4 },
    { id: 'm_zhou', name: '周启', number: '23', position: '中锋', avatar: avatars[2], phone: '13800002222', joinedAt: '2023-08-19', bio: '内线篮板和掩护。', videoUrl: '', scoreAvg: 12.3, reboundAvg: 6.5, balance: 240, spentAmount: 280, honors: 2 },
    { id: 'm_xu', name: '徐鸣', number: '09', position: '后卫', avatar: avatars[3], phone: '13800009999', joinedAt: '2024-06-04', bio: '无球跑位，外线投射。', videoUrl: '', scoreAvg: 10.6, reboundAvg: 8.2, balance: 180, spentAmount: 320, honors: 1 },
    { id: 'm_zhao', name: '赵凡', number: '18', position: '新队员', avatar: '', phone: '', joinedAt: '2026-10-18', bio: '', videoUrl: '', scoreAvg: 0, reboundAvg: 0, balance: 0, spentAmount: 0, honors: 0 },
    { id: 'm_li', name: '李川', number: '06', position: '新队员', avatar: '', phone: '', joinedAt: '2026-10-25', bio: '', videoUrl: '', scoreAvg: 0, reboundAvg: 0, balance: 0, spentAmount: 0, honors: 0 }
  ],
  matches: [
    {
      id: 'match_2026_11_12', title: '社区六之家篮球友谊赛', status: 'upcoming', startAt: '2026-11-15T19:30:00+08:00', endAt: '2026-11-15T21:30:00+08:00', signupDeadline: '2026-11-15T18:30:00+08:00', location: '社区六之家篮球场', maxPlayers: 20,
      coverUrl: courtImage, images: [courtImage], videoUrl: '', description: '提前 15 分钟到场热身。报名后可在队员列表查看本场名单。',
      signups: ['m_chen', 'm_lin', 'm_zhou', 'm_xu', 'm_zhao'].map((memberId, index) => ({ memberId, signedAt: `2026-11-0${index + 6}T10:00:00+08:00` })), result: null
    },
    {
      id: 'match_2026_11_11', title: '社区六之家三人赛', status: 'live', startAt: '2026-11-11T19:30:00+08:00', endAt: '2026-11-11T21:30:00+08:00', signupDeadline: '2026-11-11T15:00:00+08:00', location: '社区六之家篮球场', maxPlayers: 12,
      coverUrl: courtImage, images: [courtImage], videoUrl: '', description: '个人技术训练与半场分组对抗。',
      signups: ['m_chen', 'm_lin', 'm_zhou', 'm_xu'].map(memberId => ({ memberId, signedAt: '2026-11-10T12:00:00+08:00' })), result: { published: false, teams: [] }
    },
    {
      id: 'match_2026_11_05', title: '社区六之家篮球交流赛', status: 'completed', startAt: '2026-11-08T19:30:00+08:00', endAt: '2026-11-08T21:30:00+08:00', signupDeadline: '2026-11-08T18:30:00+08:00', location: '社区六之家篮球场', maxPlayers: 20,
      coverUrl: courtImage, images: [courtImage], videoUrl: '', description: '分组对抗记录。',
      signups: ['m_chen', 'm_lin', 'm_zhou', 'm_xu', 'm_zhao'].map(memberId => ({ memberId, signedAt: '2026-11-04T12:00:00+08:00' })),
      result: { published: true, updatedAt: '2026-11-08T22:15:00+08:00', champion: '蓝队', games: [
        { round: '半决赛', teamA: '蓝队', scoreA: 58, teamB: '白队', scoreB: 52 },
        { round: '半决赛', teamA: '红队', scoreA: 46, teamB: '黑队', scoreB: 61 },
        { round: '决赛', teamA: '蓝队', scoreA: 68, teamB: '黑队', scoreB: 62 }
      ], periodScores: [
        { label: '蓝队', quarters: [18, 16, 20, 14], total: 68 },
        { label: '黑队', quarters: [15, 17, 16, 14], total: 62 }
      ], teams: [
        { id: 'team_blue', name: '蓝队', score: 68, players: [{ memberId: 'm_chen', points: 15, assists: 6, rebounds: 3 }, { memberId: 'm_zhou', points: 12, assists: 2, rebounds: 9 }, { memberId: 'm_zhao', points: 8, assists: 1, rebounds: 4 }] },
        { id: 'team_black', name: '黑队', score: 62, players: [{ memberId: 'm_lin', points: 18, assists: 4, rebounds: 7 }, { memberId: 'm_xu', points: 14, assists: 3, rebounds: 3 } ] }
      ] }
    },
    {
      id: 'match_2026_10_29', title: '周末篮球友谊赛', status: 'completed', startAt: '2026-11-01T19:30:00+08:00', endAt: '2026-11-01T21:30:00+08:00', signupDeadline: '2026-11-01T18:30:00+08:00', location: '社区六之家篮球场', maxPlayers: 20,
      coverUrl: courtImage, images: [courtImage], videoUrl: '', description: '本场结果等待队务公布。',
      signups: ['m_chen', 'm_lin', 'm_zhou'].map(memberId => ({ memberId, signedAt: '2026-10-28T12:00:00+08:00' })), result: { published: false, teams: [] }
    }
  ],
  charges: [
    { id: 'charge_001', memberId: 'm_chen', amount: 300, date: '2026-11-01', note: '11 月活动充值', createdAt: '2026-11-01T10:00:00+08:00' },
    { id: 'charge_002', memberId: 'm_lin', amount: 500, date: '2026-11-02', note: '月度充值', createdAt: '2026-11-02T10:00:00+08:00' },
    { id: 'charge_003', memberId: 'm_zhou', amount: 200, date: '2026-11-04', note: '', createdAt: '2026-11-04T10:00:00+08:00' }
  ],
  authUsers: [
    { id: 'admin_001', role: 'admin', name: '队务管理员', memberId: null },
    ...['m_chen', 'm_lin', 'm_zhou', 'm_xu', 'm_zhao', 'm_li'].map(id => ({ id, role: 'member', memberId: id }))
  ]
}

export function freshSeed() {
  return structuredClone(seedData)
}
