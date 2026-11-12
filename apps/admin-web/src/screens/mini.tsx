import { useEffect, useMemo, useState } from "react";
import { Avatar, Button, Card, Chip, Input, Tabs } from "heroui-native";
import { Image, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { api, assetUrl, clearSession, getSession, saveSession, type Match, type Member, type Session } from "../api";
import { CreateMatchScreen } from "./create-match";
import { LoadingState, MainTabBar, MessageState, PageFrame, PageHeader, SuccessToast } from "../components/shared";
import { styles } from "../theme/styles";
import { formatDateTime, shortDate } from "../utils/date";
import type { MainTab, Period } from "../types";

const statusOptions = [
  { key: "all", label: "全部" },
  { key: "upcoming", label: "未开始" },
  { key: "live", label: "比赛中" },
  { key: "completed", label: "已结束" },
];

export function MiniApp() {
  const [tab, setTab] = useState<MainTab>("matches");
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState("");

  const openMatch = (id: string) => { setSelectedMatch(id); setShowCreate(false); };
  const openMember = (id: string) => { setSelectedMember(id); setSelectedMatch(null); setShowCreate(false); };
  const goToTab = (next: MainTab) => { setSelectedMatch(null); setSelectedMember(null); setShowCreate(false); setTab(next); };

  if (showCreate) {
    return <CreateMatchScreen onBack={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); setSelectedMatch(null); setSelectedMember(null); setTab("matches"); setToast("发布成功"); }} />;
  }
  if (showLogin) return <LoginScreen onBack={() => setShowLogin(false)} onComplete={() => setShowLogin(false)} />;
  if (showSettings) return <SettingsScreen session={getSession()} onBack={() => setShowSettings(false)} onLogout={() => { setShowSettings(false); setTab("profile"); }} />;
  if (selectedMatch) {
    return <MatchDetailScreen id={selectedMatch} onBack={() => setSelectedMatch(null)} onSignIn={() => setShowLogin(true)} />;
  }
  if (selectedMember) {
    return <MemberDetailScreen id={selectedMember} onBack={() => setSelectedMember(null)} onChangeTab={goToTab} />;
  }

  return (
    <PageFrame dark={tab === "leaderboard"} bottom={<MainTabBar tab={tab} onChange={goToTab} />} overlay={toast ? <SuccessToast message={toast} onClose={() => setToast("")} /> : null}>
      {tab === "matches" && <MatchesScreen onOpen={openMatch} onCreate={() => setShowCreate(true)} />}
      {tab === "leaderboard" && <LeaderboardScreen />}
      {tab === "members" && <MembersScreen onOpen={openMember} />}
      {tab === "profile" && <ProfileScreen onLogin={() => setShowLogin(true)} onOpenSettings={() => setShowSettings(true)} />}
    </PageFrame>
  );
}

function MatchesScreen({ onOpen, onCreate }: { onOpen: (id: string) => void; onCreate: () => void }) {
  const [filter, setFilter] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const session = getSession();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api.matches(filter)
      .then((items) => { if (active) setMatches(items); })
      .catch((reason: Error) => { if (active) { setMatches([]); setError(reason.message); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filter, reloadKey]);

  const visibleMatches = useMemo(() => matches.filter((item) => `${item.title} ${item.location}`.toLowerCase().includes(keyword.trim().toLowerCase())), [keyword, matches]);
  return (
    <View style={styles.screen}>
      <PageHeader title="比赛报名" right={session?.user.role === "admin" ? <Button size="sm" variant="primary" onPress={onCreate}><Button.Label>＋ 新建</Button.Label></Button> : undefined} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.searchBox}>
          <Image source={{ uri: "/static/icons/magnifier.svg" }} style={styles.searchIcon} />
          <Input accessibilityLabel="比赛搜索" value={keyword} onChangeText={setKeyword} placeholder="请输入关键字搜索" placeholderTextColor="#99b0cc" style={styles.searchInput} className="flex-1 bg-transparent text-[#f5fcff]" />
        </View>
        <View style={styles.filterRow}>
          {statusOptions.map((option) => (
            <Pressable key={option.key} onPress={() => setFilter(option.key)}>
              <Chip color={filter === option.key ? "accent" : "default"} variant={filter === option.key ? "primary" : "soft"} size="sm" className={filter === option.key ? "bg-[#1d4ed8]" : "bg-white/10"}>
                <Chip.Label className={filter === option.key ? "text-[#f5fcff]" : "text-[#b0c9e3]"}>{option.label}</Chip.Label>
              </Chip>
            </Pressable>
          ))}
        </View>
        {loading ? <LoadingState label="正在读取比赛…" /> : null}
        {!loading && error ? <MessageState message={error} action="重新加载" onAction={() => setReloadKey((value) => value + 1)} /> : null}
        {!loading && !error && visibleMatches.length === 0 ? <MessageState message="还没有符合条件的比赛，换个状态再看看。" /> : null}
        {!loading && !error ? visibleMatches.map((match) => <MatchCard key={match.id} match={match} onPress={() => onOpen(match.id)} />) : null}
      </ScrollView>
    </View>
  );
}

export function MatchCard({ match, onPress }: { match: Match; onPress: () => void }) {
  const start = formatDateTime(match.startAt);
  const statusLabel = match.status === "upcoming" ? "未开始" : match.status === "live" ? "比赛中" : "已结束";
  const statusStyle = match.status === "live" ? styles.statusLive : match.status === "completed" ? styles.statusEnded : styles.statusUpcoming;
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Card style={styles.matchCard} className="overflow-hidden rounded-3xl border border-white/20 bg-[#22395d] p-4">
        <View style={styles.matchCardCopy}>
          <View style={[styles.statusBadge, statusStyle]}><Text style={styles.statusBadgeText}>{statusLabel}</Text></View>
          <Text numberOfLines={1} style={styles.matchTitle}>{match.title}</Text>
          <Text style={styles.matchMeta}>{start.date} {start.weekday} · {start.time}–{formatDateTime(match.endAt).time}</Text>
          <Text numberOfLines={1} style={styles.matchLocation}>{match.location}</Text>
          <View style={styles.tagRow}>
            <Chip color="default" variant="soft" size="sm" className="bg-white/10"><Chip.Label className="text-[#b0c9e3]">5人制</Chip.Label></Chip>
            <Chip color="default" variant="soft" size="sm" className="bg-white/10"><Chip.Label className="text-[#b0c9e3]">均衡分组</Chip.Label></Chip>
          </View>
          <View style={styles.rosterLine}>
            <View style={styles.avatarStack}>
              {match.signups.slice(0, 4).map((person, index) => <MiniAvatar key={person.memberId} person={person} overlap={index > 0} />)}
            </View>
            <Text style={styles.rosterCount}>{match.registeredCount}/{match.maxPlayers} 人　已报名</Text>
          </View>
        </View>
        <Image source={{ uri: assetUrl(match.coverUrl) || "/static/covers/basketball-hoop.png" }} style={styles.matchCover} resizeMode="cover" />
      </Card>
    </Pressable>
  );
}

function MiniAvatar({ person, overlap = false }: { person: Pick<Member, "avatar" | "name"> | { avatar: string; name: string }; overlap?: boolean }) {
  return (
    <View style={[styles.avatarSmall, overlap && styles.avatarOverlap]}>
      <Avatar size="sm" style={styles.avatarComponent}>
        {person.avatar ? <Avatar.Image source={{ uri: assetUrl(person.avatar) }} /> : <Avatar.Fallback>{person.name.slice(0, 1)}</Avatar.Fallback>}
      </Avatar>
    </View>
  );
}

function MatchDetailScreen({ id, onBack, onSignIn }: { id: string; onBack: () => void; onSignIn: () => void }) {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<"details" | "results">("details");
  const [confirmAction, setConfirmAction] = useState<"signup" | "cancel" | null>(null);
  const [showRoster, setShowRoster] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const session = getSession();

  useEffect(() => {
    let active = true;
    api.match(id).then((value) => { if (active) setMatch(value); }).catch((reason: Error) => { if (active) setError(reason.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  async function submitSignupAction() {
    if (!match || !confirmAction) return;
    if (!session?.user || session.user.role !== "member") { setConfirmAction(null); onSignIn(); return; }
    const action = confirmAction;
    setBusy(true);
    setError("");
    try {
      const updated = action === "signup" ? await api.signup(id) : await api.cancelSignup(id);
      setMatch(updated);
      setConfirmAction(null);
      setNotice(action === "signup" ? "报名成功" : "已取消报名");
    } catch (reason) {
      setConfirmAction(null);
      setError((reason as Error).message);
    } finally { setBusy(false); }
  }

  if (showRoster && match) return <ParticipantsScreen match={match} onBack={() => setShowRoster(false)} />;
  if (showScore && match) return <ScoreDetailScreen match={match} onBack={() => setShowScore(false)} />;
  const signedUp = Boolean(match?.isSignedUp && session?.user.role === "member");
  const statusLabel = match?.status === "live" ? "比赛中" : match?.status === "completed" ? "已结束" : "未开始";
  const start = match ? formatDateTime(match.startAt) : null;
  const end = match ? formatDateTime(match.endAt) : null;
  const deadline = match ? formatDateTime(match.signupDeadline) : null;

  return (
    <PageFrame overlay={confirmAction ? <ConfirmDialog title={confirmAction === "signup" ? "确认报名？" : "取消本次报名？"} busy={busy} onCancel={() => setConfirmAction(null)} onConfirm={() => { void submitSignupAction(); }} /> : notice ? <DarkToast message={notice} onClose={() => setNotice("")} /> : null}>
      <View style={styles.screen}>
        <PageHeader title="比赛详情" onBack={onBack} />
        {loading ? <LoadingState label="正在读取比赛…" /> : null}
        {!loading && error && !match ? <MessageState message={error} /> : null}
        {match && start && end && deadline ? (
          <>
            <ScrollView contentContainerStyle={styles.detailPageContent} showsVerticalScrollIndicator={false}>
              {signedUp ? <View style={styles.signupIdentity}><Avatar size="sm" style={styles.signupAvatar}>{session?.user.avatar ? <Avatar.Image source={{ uri: assetUrl(session.user.avatar) }} /> : <Avatar.Fallback>{session?.user.name.slice(0, 1)}</Avatar.Fallback>}</Avatar><Text style={styles.signupIdentityText}>{session?.user.name} · 我已报名</Text><Chip color="accent" variant="soft" size="sm"><Chip.Label>报名成功</Chip.Label></Chip></View> : null}
              {signedUp ? <Text style={styles.signupCountText}>✓ 报名人数 {match.registeredCount} / {match.maxPlayers} 人 · 剩余 {Math.max(0, match.maxPlayers - match.registeredCount)} 个名额</Text> : null}
              <Card style={styles.detailCard} className="rounded-3xl border border-white/20 bg-[#22395d] p-4">
                <View style={styles.detailSummaryTop}><Chip color="default" variant="soft" size="sm" className="bg-white/10"><Chip.Label className="text-[#b0c9e3]">社区内部</Chip.Label></Chip><View style={[styles.detailStatusBadge, match.status === "upcoming" ? styles.statusUpcoming : match.status === "live" ? styles.statusLive : styles.statusEnded]}><Text style={styles.statusBadgeText}>{statusLabel}</Text></View></View>
                <Text style={styles.detailTitle}>{match.title}</Text>
                <View style={styles.detailChips}>{(match.tags?.length ? match.tags : ["5人制", "均衡分组", "新人友好"]).map((tag) => <Chip key={tag} color="default" variant="soft" size="sm" className="bg-white/10"><Chip.Label className="text-[#b0c9e3]">{tag}</Chip.Label></Chip>)}</View>
                <Image source={{ uri: assetUrl(match.coverUrl) || "/static/covers/match-detail-hoop.png" }} style={styles.detailCover} resizeMode="cover" />
              </Card>
              <View style={styles.detailTabs}>
                <Pressable accessibilityRole="tab" onPress={() => setTab("details")} style={[styles.detailTab, tab === "details" && styles.detailTabActive]}><Text style={tab === "details" ? styles.detailTabTextActive : styles.detailTabText}>比赛详情</Text></Pressable>
                <Pressable accessibilityRole="tab" onPress={() => setTab("results")} style={[styles.detailTab, tab === "results" && styles.detailTabActive]}><Text style={tab === "results" ? styles.detailTabTextActive : styles.detailTabText}>比赛结果</Text></Pressable>
              </View>
              {tab === "details" ? <>
                <View style={styles.detailInfoCard}>
                  <DetailInfoRow label="比赛时间" value={start.date + " " + start.weekday + " " + start.time + "–" + end.time} />
                  <DetailInfoRow label="比赛地点" value={match.location + (match.location.includes("1号场") ? "" : " · 1号场")} />
                  <DetailInfoRow label="报名截止" value={deadline.date + " " + deadline.time} />
                  <DetailInfoRow label="比赛形式" value={(match.tags?.[0] || "5人制") + " 友谊赛 · 4队均衡分组"} last />
                </View>
                <Text style={styles.galleryHint}>照片与说明 · 继续向下查看</Text>
                {match.images.length > 1 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.detailImages}>{match.images.map((url, index) => <Image key={url + index} source={{ uri: assetUrl(url) }} style={styles.detailImageThumb} resizeMode="cover" />)}</ScrollView> : null}
                <Pressable onPress={() => setShowRoster(true)} accessibilityRole="button">
                  <View style={styles.rosterSummary}>
                    <View style={styles.rosterSummaryTop}><Text style={styles.rosterSummaryTitle}>报名队员</Text><Text style={styles.rosterSummaryCount}>{match.registeredCount}<Text style={styles.rosterSummaryMuted}> / {match.maxPlayers} 人 ›</Text></Text></View>
                    <View style={styles.rosterSummaryBottom}><View style={styles.avatarStack}>{match.signups.slice(0, 4).map((person, index) => <MiniAvatar key={person.memberId} person={person} overlap={index > 0} />)}</View><Text numberOfLines={1} style={styles.rosterSummaryNames}>{match.signups.slice(0, 2).map((person) => person.name).join("、")}{match.signups.length > 2 ? "等已报名" : "已报名"}</Text></View>
                  </View>
                </Pressable>
                <Text style={styles.detailDescription}>{match.description}</Text>
              </> : <MatchResultsContent match={match} onDetails={() => setTab("details")} onScore={() => setShowScore(true)} onBackToList={onBack} />}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </ScrollView>
            {tab === "details" ? <View style={styles.detailAction}>
              {signedUp ? <>
                <Text style={styles.footerCheck}>✓　已报名 · 比赛前请提前 15 分钟到场</Text>
                <View style={styles.detailActionRow}><Button isDisabled={busy} variant="secondary" onPress={() => setConfirmAction("cancel")} className="h-12 w-[120px] rounded-3xl bg-white/10"><Button.Label className="text-white">取消报名</Button.Label></Button><Button isDisabled={busy} variant="secondary" onPress={() => setShowRoster(true)} className="h-12 flex-1 rounded-3xl bg-white/10"><Button.Label className="text-white">查看报名队员</Button.Label></Button></View>
              </> : <>
                <Text style={styles.footerCheck}>免费报名 · 已预付，无需再次支付</Text>
                <Button isDisabled={busy || match.status !== "upcoming"} variant="primary" onPress={() => { if (!session?.user || session.user.role !== "member") onSignIn(); else setConfirmAction("signup"); }} className="h-12 w-full rounded-3xl bg-[#1d4ed8]"><Button.Label className="text-[15px] font-semibold text-white">{match.status === "upcoming" ? "确认报名" : "报名已截止"}</Button.Label></Button>
              </>}
            </View> : null}
          </>
        ) : null}
      </View>
    </PageFrame>
  );
}

function DetailInfoRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return <View style={[styles.detailInfoRow, !last && styles.detailInfoDivider]}><Text style={styles.detailInfoLabel}>{label}</Text><Text style={styles.detailInfoValue}>{value}</Text></View>;
}

function MatchResultsContent({ match, onDetails, onScore, onBackToList }: { match: Match; onDetails: () => void; onScore: () => void; onBackToList: () => void }) {
  const result = match.result;
  if (!result?.published) return <View style={styles.resultEmpty}>
    <Image source={{ uri: "/static/icons/trophy.svg" }} style={styles.resultCup} /><Text style={styles.resultEmptyTitle}>比赛结果尚未公布</Text>
    <Text style={styles.resultEmptyCopy}>比赛结束后，管理员会更新对阵及比分。</Text><Text style={styles.resultEmptyCopy}>你可以先查看比赛详情和报名队员。</Text>
    <Button variant="secondary" onPress={onDetails} className="h-12 w-full rounded-3xl bg-white/10"><Button.Label className="text-white">查看比赛详情</Button.Label></Button>
    {match.status === "completed" ? <Button variant="secondary" onPress={onBackToList} className="h-12 w-full rounded-3xl bg-white/10"><Button.Label className="text-white">返回比赛列表</Button.Label></Button> : null}
  </View>;
  const games = result.games || [];
  const semifinals = games.filter((game) => game.round === "半决赛");
  const finalGame = games.find((game) => game.round === "决赛") || games[games.length - 1];
  const date = formatDateTime(match.startAt);
  return <View style={styles.resultsContent}>
    <View style={styles.resultsMeta}><Chip color="default" variant="soft" size="sm" className="bg-white/10"><Chip.Label className="text-[#b0c9e3]">已结束</Chip.Label></Chip><Text style={styles.resultsMetaText}>{date.date} · 4 队 / {games.length || 3} 场比赛</Text></View>
    <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>对阵图</Text><Text style={styles.sectionCount}>比分已更新</Text></View>
    <View style={styles.bracketBlock}>
      <View style={styles.bracketColumn}><Text style={styles.bracketHeading}>半决赛</Text>{semifinals.map((game, index) => <Text key={game.round + index} style={styles.bracketGame}>{game.teamA} {game.scoreA} : {game.scoreB} {game.teamB}</Text>)}</View>
      <View style={styles.bracketColumn}><Text style={styles.bracketHeading}>决赛</Text>{finalGame ? <><Text style={styles.bracketGame}>{finalGame.teamA} {finalGame.scoreA} : {finalGame.scoreB} {finalGame.teamB}</Text><Text style={styles.bracketChampion}>冠军 · {result.champion || finalGame.teamA}</Text></> : null}</View>
    </View>
    <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>决赛比分</Text><Text style={styles.sectionCount}>点击查看分节比分</Text></View>
    {finalGame ? <Pressable onPress={onScore} style={styles.finalScoreCard}><View style={styles.finalScoreMeta}><Text style={styles.sectionCount}>决赛</Text><Text style={styles.sectionCount}>已结束　›</Text></View><View style={styles.finalScoreRow}><Text style={styles.memberName}>{finalGame.teamA}</Text><Text style={styles.finalScore}>{finalGame.scoreA} : {finalGame.scoreB}</Text><Text style={styles.memberName}>{finalGame.teamB}</Text></View></Pressable> : <Text style={styles.emptyRoster}>暂无比分</Text>}
    <Text style={styles.resultsFootnote}>比分由管理员赛后更新</Text><Button variant="secondary" onPress={onBackToList} className="h-12 w-full rounded-3xl bg-white/10"><Button.Label className="text-white">返回比赛列表</Button.Label></Button>
  </View>;
}

function ScoreDetailScreen({ match, onBack }: { match: Match; onBack: () => void }) {
  const result = match.result;
  const finalGame = result?.games?.find((game) => game.round === "决赛") || result?.games?.[result.games.length - 1];
  const date = formatDateTime(match.endAt);
  return <PageFrame><View style={styles.screen}><PageHeader title="比分详情" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.scoreDetailContent} showsVerticalScrollIndicator={false}>
      <Chip color="default" variant="soft" size="sm" className="self-start bg-white/10"><Chip.Label className="text-[#b0c9e3]">决赛 · 已结束</Chip.Label></Chip><Text style={styles.scoreMatchTitle}>{match.title}</Text>
      <View style={styles.scoreHero}><View style={styles.scoreTeam}><Image source={{ uri: "/static/icons/basketball.svg" }} style={styles.basketballMark} /><Text style={styles.memberName}>{finalGame?.teamA || "蓝队"}</Text></View><View style={styles.scoreCenter}><Text style={styles.finalScore}>{finalGame?.scoreA ?? "—"} : {finalGame?.scoreB ?? "—"}</Text><Text style={styles.sectionCount}>全场比分</Text></View><View style={styles.scoreTeam}><Image source={{ uri: "/static/icons/basketball.svg" }} style={styles.basketballMark} /><Text style={styles.memberName}>{finalGame?.teamB || "黑队"}</Text></View></View>
      <Text style={styles.scoreMeta}>{date.date} 21:00 · {match.location}</Text><Text style={styles.sectionTitle}>分节比分</Text>
      <View style={styles.periodTable}><View style={styles.periodRow}>{["球队", "一节", "二节", "三节", "四节", "总分"].map((label) => <Text key={label} style={[styles.periodCell, styles.periodHeader]}>{label}</Text>)}</View>{(result?.periodScores || []).map((team) => <View key={team.label} style={styles.periodRow}><Text style={styles.periodCell}>{team.label}</Text>{team.quarters.slice(0, 4).map((score, index) => <Text key={index} style={styles.periodCell}>{score}</Text>)}<Text style={[styles.periodCell, styles.periodTotal]}>{team.total}</Text></View>)}</View>
      <View style={styles.scoreDescription}><Text style={styles.sectionTitle}>比赛说明</Text><Text style={styles.detailDescription}>全场比分为四节得分之和。本场无加时。</Text><Text style={styles.sectionCount}>更新于 {result?.updatedAt ? formatDateTime(result.updatedAt).date + " " + formatDateTime(result.updatedAt).time : date.date + " " + date.time}</Text></View>
    </ScrollView><View style={styles.detailAction}><Button variant="secondary" onPress={onBack} className="h-12 w-full rounded-3xl bg-white/10"><Button.Label className="text-white">返回比赛结果</Button.Label></Button></View>
  </View></PageFrame>;
}

function ParticipantsScreen({ match, onBack }: { match: Match; onBack: () => void }) {
  const signups = [...match.signups].sort((a, b) => a.signedAt.localeCompare(b.signedAt));
  return <PageFrame><View style={styles.screen}><PageHeader title="报名队员" onBack={onBack} />
    <ScrollView contentContainerStyle={styles.rosterPageContent} showsVerticalScrollIndicator={false}>
      <View style={styles.rosterPageIntro}><View style={styles.rosterSummaryTop}><Text style={styles.rosterSummaryTitle}>已报名</Text><Text style={styles.rosterSummaryCount}>{match.registeredCount}<Text style={styles.rosterSummaryMuted}> / {match.maxPlayers} 人</Text></Text></View><Text style={styles.rosterPageHint}>展示微信头像和昵称，按报名时间排序</Text></View>
      <View style={styles.rosterListCard}>{signups.map((person, index) => <View key={person.memberId} style={[styles.rosterPersonRow, index < signups.length - 1 && styles.rowDivider]}><Avatar size="sm" style={styles.rosterPersonAvatar}>{person.avatar ? <Avatar.Image source={{ uri: assetUrl(person.avatar) }} /> : <Avatar.Fallback>{person.initial}</Avatar.Fallback>}</Avatar><View style={styles.memberRowCopy}><Text style={styles.memberName}>{person.name}</Text><Text style={styles.memberSub}>{formatDateTime(person.signedAt).date} {formatDateTime(person.signedAt).time} 报名</Text></View><Text style={styles.attendanceCount}>已报名</Text></View>)}{!signups.length ? <Text style={styles.emptyRoster}>还没有队员报名</Text> : null}</View>
    </ScrollView>
    <View style={styles.rosterPageFooter}><Text style={styles.sectionCount}>共 {signups.length} 位队员 · 微信昵称用于比赛报名</Text><Button variant="secondary" onPress={onBack} className="h-12 w-full rounded-3xl border border-white/50 bg-transparent"><Button.Label className="text-white">返回比赛详情</Button.Label></Button></View>
  </View></PageFrame>;
}

function ConfirmDialog({ title, busy, onCancel, onConfirm }: { title: string; busy: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <View style={styles.dialogLayer}><Pressable accessibilityRole="button" accessibilityLabel="关闭确认框" onPress={onCancel} style={styles.dialogScrim} /><View style={styles.confirmDialog}><Text style={styles.confirmTitle}>{title}</Text><View style={styles.confirmActions}><Button isDisabled={busy} variant="secondary" onPress={onCancel} className="h-11 flex-1 rounded-full bg-[#314b70]"><Button.Label className="text-white">取消</Button.Label></Button><Button isDisabled={busy} variant="primary" onPress={onConfirm} className="h-11 flex-1 rounded-full bg-[#1d4ed8]"><Button.Label className="text-white">{busy ? "处理中…" : "确认"}</Button.Label></Button></View></View></View>;
}

function DarkToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const timer = setTimeout(onClose, 3500); return () => clearTimeout(timer); }, [message, onClose]);
  return <View style={styles.darkToast}><Text style={styles.toastSpinner}>◌</Text><Text style={styles.darkToastText}>{message}</Text><Pressable accessibilityRole="button" onPress={onClose} style={styles.darkToastClose}><Text style={styles.darkToastCloseText}>×</Text></Pressable></View>;
}

function LeaderboardScreen() {
  const [period, setPeriod] = useState<Period>("season");
  const [data, setData] = useState<{ completedMatches: number; members: Member[] }>({ completedMatches: 0, members: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api.leaderboard(period).then((result) => { if (active) setData(result); }).catch((reason: Error) => { if (active) setError(reason.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [period]);

  const totalAttendances = data.members.reduce((sum, member) => sum + Number(member.attendance || 0), 0);
  const possibleAttendances = data.completedMatches * data.members.length;
  const rate = possibleAttendances ? Math.round(totalAttendances / possibleAttendances * 100) : 0;
  const absences = Math.max(0, possibleAttendances - totalAttendances);
  return (
    <View style={styles.screen}>
      <PageHeader title="出勤榜" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.boardHero} className="rounded-3xl border border-white/20 bg-[#12365d] p-5">
          <View style={styles.seasonLine}><Text style={styles.seasonTitle}>本赛季　⌄</Text><Text style={styles.seasonCaption}>出勤统计</Text></View>
          <View style={styles.boardTotal}><Text style={styles.boardNumber}>{data.completedMatches}</Text><Text style={styles.boardUnit}>场已完成活动</Text></View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCell}><Text style={styles.summaryCaption}>出勤率</Text><Text style={styles.summaryValue}>{rate}%</Text></View>
            <View style={styles.summaryCell}><Text style={styles.summaryCaption}>缺席</Text><Text style={styles.summaryValue}>{absences}</Text></View>
          </View>
        </Card>
        <View style={styles.periodTabs}>
          {[{ key: "month", label: "本月" }, { key: "season", label: "本赛季" }, { key: "all", label: "全部" }].map((item) => (
            <Pressable key={item.key} onPress={() => setPeriod(item.key as Period)} style={styles.periodPressable}>
              <Chip color={period === item.key ? "accent" : "default"} variant={period === item.key ? "primary" : "soft"} size="sm" className={period === item.key ? "bg-[#1d4ed8]" : "bg-white/10"}>
                <Chip.Label className={period === item.key ? "text-[#f5fcff]" : "text-[#b0c9e3]"}>{item.label}</Chip.Label>
              </Chip>
            </Pressable>
          ))}
        </View>
        <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>球员排名</Text><Text style={styles.sectionCount}>共 {data.members.length} 位队员</Text></View>
        {loading ? <LoadingState label="正在计算出勤…" /> : null}
        {!loading && error ? <MessageState message={error} /> : null}
        {!loading && !error ? (
          <Card style={styles.rankingCard} className="rounded-3xl border border-white/20 bg-[#22395d] px-4 py-2">
            {data.members.map((member, index) => (
              <View key={member.id} style={[styles.memberRow, index < data.members.length - 1 && styles.rowDivider]}>
                <Text style={[styles.rank, index < 3 && styles.rankTop]}>{String(member.rank || index + 1).padStart(2, "0")}</Text>
                <Avatar size="md" style={styles.avatarMedium}>
                  {member.avatar ? <Avatar.Image source={{ uri: assetUrl(member.avatar) }} /> : <Avatar.Fallback>{member.name.slice(0, 1)}</Avatar.Fallback>}
                </Avatar>
                <View style={styles.memberRowCopy}><Text style={styles.memberName}>{member.name}</Text><Text style={styles.memberSub}>{member.position} · #{member.number || "—"}</Text></View>
                <Text style={styles.attendanceCount}>{member.attendance || 0} 次</Text>
              </View>
            ))}
          </Card>
        ) : null}
      </ScrollView>
    </View>
  );
}

function MembersScreen({ onOpen }: { onOpen: (id: string) => void }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    api.members(keyword).then((items) => { if (active) setMembers(items); }).catch((reason: Error) => { if (active) setError(reason.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [keyword]);
  return (
    <View style={styles.screen}>
      <PageHeader title="队员" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.searchBox}><Image source={{ uri: "/static/icons/magnifier.svg" }} style={styles.searchIcon} /><Input accessibilityLabel="搜索队员" value={keyword} onChangeText={setKeyword} placeholder="搜索队员姓名或号码" placeholderTextColor="#99b0cc" style={styles.searchInput} className="flex-1 bg-transparent text-[#f5fcff]" /></View>
        <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>社区队员</Text><Text style={styles.sectionCount}>{members.length} 位</Text></View>
        {loading ? <LoadingState label="正在读取队员…" /> : null}
        {!loading && error ? <MessageState message={error} /> : null}
        {!loading && !error ? <Card style={styles.rankingCard} className="rounded-3xl border border-white/20 bg-[#22395d] px-4 py-2">
          {members.map((member, index) => (
            <Pressable key={member.id} onPress={() => onOpen(member.id)} style={[styles.memberRow, index < members.length - 1 && styles.rowDivider]}>
              <Avatar size="md" style={styles.avatarMedium}>{member.avatar ? <Avatar.Image source={{ uri: assetUrl(member.avatar) }} /> : <Avatar.Fallback>{member.name.slice(0, 1)}</Avatar.Fallback>}</Avatar>
              <View style={styles.memberRowCopy}><Text style={styles.memberName}>{member.name}</Text><Text style={styles.memberSub}>{member.position} · #{member.number || "—"}</Text></View>
              <Text style={styles.attendanceCount}>{member.attendance || 0} 场　›</Text>
            </Pressable>
          ))}
        </Card> : null}
      </ScrollView>
    </View>
  );
}

function MemberDetailScreen({ id, onBack, onChangeTab }: { id: string; onBack: () => void; onChangeTab: (tab: MainTab) => void }) {
  const [member, setMember] = useState<(Member & { upcomingMatches: Match[]; completedMatches: Match[] }) | null>(null);
  const [showAllAttendance, setShowAllAttendance] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { api.member(id).then(setMember).catch((reason: Error) => setError(reason.message)); }, [id]);
  return (
    <PageFrame bottom={<MainTabBar tab="members" onChange={onChangeTab} />}>
      <View style={styles.screen}>
        <PageHeader title="队员档案" onBack={onBack} />
        {!member && !error ? <LoadingState label="正在读取队员资料…" /> : null}
        {error ? <MessageState message={error} /> : null}
        {member ? <ScrollView contentContainerStyle={styles.memberProfileContent} showsVerticalScrollIndicator={false}>
          <View style={styles.memberIdentity}><Avatar size="lg" style={styles.memberDetailAvatar}>{member.avatar ? <Avatar.Image source={{ uri: assetUrl(member.avatar) }} /> : <Avatar.Fallback>{member.name.slice(0, 1)}</Avatar.Fallback>}</Avatar><View style={styles.memberIdentityCopy}><View style={styles.memberTitleLine}><Text style={styles.memberDetailName}>{member.name}</Text>{(member.attendanceStats?.total || 0) > 0 ? <Chip color="success" variant="soft" size="sm" className="bg-emerald-500/15"><Chip.Label className="text-emerald-300">稳定出勤</Chip.Label></Chip> : null}</View><Text style={styles.memberDetailSubtitle}>{member.position}　·　#{member.number || "—"}</Text></View></View>
          <View style={styles.attendanceStats}><AttendanceStat label="本月" value={member.attendanceStats?.month ?? 0} /><AttendanceStat label="本赛季" value={member.attendanceStats?.season ?? 0} /><AttendanceStat label="累计" value={member.attendanceStats?.total ?? member.attendance ?? 0} /></View>
          <View style={styles.memberSectionHeader}><Text style={styles.sectionTitle}>最近出勤</Text><Pressable accessibilityRole="button" onPress={() => setShowAllAttendance((value) => !value)}><Text style={styles.memberViewAll}>{showAllAttendance ? "收起" : "查看全部"}</Text></Pressable></View>
          {(showAllAttendance ? member.completedMatches : member.completedMatches.slice(0, 2)).map((match) => <View key={match.id} style={styles.attendanceMatchRow}><Text style={styles.attendanceDate}>{shortDate(match.startAt)}</Text><Text numberOfLines={1} style={styles.attendanceMatchTitle}>{match.title} · {match.location}</Text><Chip color="success" variant="soft" size="sm" className="bg-emerald-500/15"><Chip.Label className="text-emerald-300">已到场</Chip.Label></Chip></View>)}
          {member.videoUrl ? <><Text style={styles.sectionTitle}>球员视频</Text><Pressable onPress={() => { if (Platform.OS === "web" && typeof window !== "undefined") window.open(assetUrl(member.videoUrl), "_blank", "noopener"); }} style={styles.playerVideo}><View style={styles.playButton}><Text style={styles.playIcon}>▶</Text></View></Pressable><Text style={styles.playerVideoCaption}>{member.name} · 本周精彩片段</Text></> : null}
        </ScrollView> : null}
      </View>
    </PageFrame>
  );
}

function AttendanceStat({ label, value }: { label: string; value: number }) {
  return <View style={styles.attendanceStat}><Text style={styles.attendanceStatValue}>{value} 次</Text><Text style={styles.attendanceStatLabel}>{label}</Text></View>;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <View style={styles.statCell}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function MenuRow({ label, icon, last = false }: { label: string; icon: string; last?: boolean }) {
  return <Pressable style={[styles.menuRow, !last && styles.rowDivider]}><Image source={{ uri: icon }} style={styles.menuIcon} /><Text style={styles.menuLabel}>{label}</Text><Text style={styles.menuChevron}>›</Text></Pressable>;
}

function ProfileAdminCard({ session }: { session: Session }) {
  return (
    <Card style={styles.profileCard} className="rounded-3xl border border-white/20 bg-[#22395d] p-5">
      <View style={styles.profileIdentity}>
        <Image source={{ uri: "/brand/cbf1488-mascot.png" }} style={styles.adminMascot} />
        <View style={styles.profileIdentityCopy}><Text style={styles.profileName}>{session.user.name}</Text><Text style={styles.profileSubtitle}>社区六之家 · 管理员</Text></View>
        <Chip color="accent" variant="soft" size="sm"><Chip.Label>管理员</Chip.Label></Chip>
      </View>
      <Text style={styles.sectionTitle}>管理工具</Text>
      <MenuRow label="队员管理" icon="/static/icons/members-persons.svg" />
      <MenuRow label="充值记录" icon="/static/icons/profile-receipt.svg" />
      <MenuRow label="登记充值" icon="/static/icons/field-wallet.svg" last />
    </Card>
  );
}

function ProfileScreen({ onLogin, onOpenSettings }: { onLogin: () => void; onOpenSettings: () => void }) {
  const [session, setSession] = useState<Session | null>(getSession());
  const [profile, setProfile] = useState<{ member: Member; attendance: number; balance: number; honors: number } | null>(null);
  const [error, setError] = useState("");
  const demoMode = process.env.EXPO_PUBLIC_DEMO_MODE !== "false" && process.env.NODE_ENV !== "production";

  useEffect(() => {
    let active = true;
    if (session?.user.role !== "member") return () => { active = false; };
    api.profile().then((value) => { if (active) setProfile(value); }).catch((reason: Error) => { if (active) setError(reason.message); });
    return () => { active = false; };
  }, [session?.user.id, session?.user.role]);

  return (
    <View style={styles.screen}>
      <PageHeader title="我的" right={session ? <Pressable accessibilityRole="button" accessibilityLabel="设置" onPress={onOpenSettings}><Image source={{ uri: "/static/icons/settings.svg" }} style={styles.settingsIcon} /></Pressable> : undefined} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!session ? (
          <Card style={styles.guestCard} className="rounded-3xl border border-white/20 bg-[#22395d] p-6">
            <Image source={{ uri: "/static/icons/login-basketball.svg" }} style={styles.guestBall} />
            <Text style={styles.guestTitle}>加入社区篮球</Text>
            <Text style={styles.guestCopy}>登录后报名比赛、查看出勤与个人记录</Text>
            <Button variant="primary" onPress={onLogin} className="mt-5 h-12 w-full rounded-xl bg-[#1d4ed8]">
              <Button.Label className="text-white">手机号快捷登录</Button.Label>
            </Button>
            <Text style={styles.guestNote}>{demoMode ? "当前为本地演示登录" : "微信手机号授权待完成平台配置"}</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </Card>
        ) : session.user.role === "admin" ? (
          <ProfileAdminCard session={session} />
        ) : (
          <Card style={styles.profileCard} className="rounded-3xl border border-white/20 bg-[#22395d] p-5">
            <View style={styles.profileIdentity}>
              <Avatar size="lg" style={styles.avatarLarge}>{session.user.avatar ? <Avatar.Image source={{ uri: assetUrl(session.user.avatar) }} /> : <Avatar.Fallback>{session.user.name.slice(0, 1)}</Avatar.Fallback>}</Avatar>
              <View style={styles.profileIdentityCopy}><Text style={styles.profileName}>{session.user.name}</Text><Text style={styles.profileSubtitle}>社区六之家 · 球员</Text></View>
              <Text style={styles.jerseyNumber}>#{profile?.member.number || "—"}</Text>
            </View>
            <View style={styles.profileStats}>
              <Stat label="出勤场次" value={profile?.attendance ?? "—"} />
              <Stat label="账户余额" value={profile ? `¥${profile.balance.toFixed(0)}` : "—"} />
              <Stat label="获得荣誉" value={profile?.honors ?? "—"} />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Text style={styles.sectionTitle}>我的记录</Text>
            <MenuRow label="比赛与出勤" icon="/static/icons/profile-attendance.svg" />
            <MenuRow label="账户记录" icon="/static/icons/profile-receipt.svg" />
            <MenuRow label="荣誉与数据" icon="/static/icons/profile-honor.svg" />
            <MenuRow label="我的相册" icon="/static/icons/profile-album.svg" last />
          </Card>
        )}
        <Text style={styles.footnote}>CBF1488 · Community Basketball</Text>
      </ScrollView>
    </View>
  );
}

function LoginScreen({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) {
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [showPhoneSheet, setShowPhoneSheet] = useState(false);
  const [showAgreementSheet, setShowAgreementSheet] = useState(false);
  const [busy, setBusy] = useState(false);
  const demoMode = process.env.EXPO_PUBLIC_DEMO_MODE !== "false" && process.env.NODE_ENV !== "production";

  async function allowPhone() {
    if (!demoMode) {
      setShowPhoneSheet(false);
      setError("微信手机号授权待完成平台配置");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const session = await api.demoLogin("member");
      saveSession(session);
      onComplete();
    } catch (reason) { setError((reason as Error).message); }
    finally { setBusy(false); setShowPhoneSheet(false); }
  }

  return <PageFrame overlay={showPhoneSheet ? <View style={styles.phoneSheetLayer}><Pressable onPress={() => setShowPhoneSheet(false)} style={styles.phoneSheetScrim} /><View style={styles.phoneSheet}><Text style={styles.phoneSheetTitle}>使用手机号</Text><Text style={styles.phoneSheetCopy}>使用以下手机号完成快捷登录</Text><View style={styles.phoneSheetNumber}><Text style={styles.phoneIcon}>♙</Text><Text style={styles.phoneNumber}>138 **** 8888</Text></View><Button isDisabled={busy || !demoMode} variant="primary" onPress={() => { void allowPhone(); }} className="h-12 w-full rounded-full bg-[#1d4ed8]"><Button.Label className="text-white">{busy ? "正在登录…" : "允许使用"}</Button.Label></Button><Pressable onPress={() => setShowPhoneSheet(false)} style={styles.phoneSheetCancel}><Text style={styles.phoneSheetCancelText}>暂不允许</Text></Pressable></View></View> : showAgreementSheet ? <AgreementSheet onCancel={() => setShowAgreementSheet(false)} onAgree={() => { setAgreed(true); setShowAgreementSheet(false); setError(""); }} /> : null}>
    <View style={styles.screen}><PageHeader title="手机号快捷登录" onBack={onBack} />
      <View style={styles.loginContent}><Image source={{ uri: "/brand/cbf1488-mascot.png" }} style={styles.loginMascot} /><Text style={styles.loginTitle}>欢迎回到球场</Text><Text style={styles.loginCaption}>使用微信绑定的手机号登录</Text>
        <Button onPress={() => { if (!agreed) setError("请先勾选用户协议与隐私政策"); else { setError(""); setShowPhoneSheet(true); } }} variant="primary" className="mt-12 h-12 w-full rounded-xl bg-[#1d4ed8]"><Button.Label className="text-white">手机号快捷登录</Button.Label></Button>
        <Pressable onPress={() => { setAgreed((value) => !value); setError(""); }} style={styles.agreementRow}><View style={[styles.agreementCheckbox, agreed && styles.agreementCheckboxSelected]}>{agreed ? <Text style={styles.agreementCheck}>✓</Text> : null}</View><Text style={styles.agreementText}>已阅读并同意</Text><Pressable onPress={(event) => { event.stopPropagation(); setShowAgreementSheet(true); }}><Text style={styles.agreementLink}>《用户协议》</Text></Pressable><Text style={styles.agreementText}>和</Text><Pressable onPress={(event) => { event.stopPropagation(); setShowAgreementSheet(true); }}><Text style={styles.agreementLink}>《隐私政策》</Text></Pressable></Pressable>
        {error ? <View style={styles.loginError}><Text style={styles.loginErrorIcon}>ⓘ</Text><Text style={styles.loginErrorText}>{error}</Text></View> : null}
      </View>
    </View>
  </PageFrame>;
}

function AgreementSheet({ onCancel, onAgree }: { onCancel: () => void; onAgree: () => void }) {
  return <View style={styles.phoneSheetLayer}><Pressable onPress={onCancel} style={styles.phoneSheetScrim} /><View style={styles.agreementSheet}><Text style={styles.phoneSheetTitle}>阅读并同意后继续</Text><Text style={styles.phoneSheetCopy}>《用户协议》与《隐私政策》</Text><View style={styles.agreementSheetActions}><Button variant="secondary" onPress={onCancel} className="h-12 flex-1 rounded-full bg-[#314b70]"><Button.Label className="text-white">取消</Button.Label></Button><Button variant="primary" onPress={onAgree} className="h-12 flex-1 rounded-full bg-[#1d4ed8]"><Button.Label className="text-white">同意并继续</Button.Label></Button></View></View></View>;
}

function SettingsScreen({ session, onBack, onLogout }: { session: Session | null; onBack: () => void; onLogout: () => void }) {
  const [profile, setProfile] = useState<{ member: Member } | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  useEffect(() => { if (session?.user.role === "member") api.profile().then(setProfile).catch(() => undefined); }, [session?.user.id, session?.user.role]);
  const phone = profile?.member.phone ? profile.member.phone.slice(0, 3) + " **** " + profile.member.phone.slice(-4) : "未绑定";
  function logout() { clearSession(); setConfirmLogout(false); onLogout(); }
  return <PageFrame overlay={confirmLogout ? <ConfirmDialog title="退出登录？" busy={false} onCancel={() => setConfirmLogout(false)} onConfirm={logout} /> : null}>
    <View style={styles.screen}><PageHeader title="设置" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.settingsContent}>
        <View style={styles.settingsIdentity}><View style={styles.settingsIdentityCopy}><Text style={styles.settingsName}>{session?.user.name || "队员"}</Text><Text style={styles.settingsRole}>社区球员</Text></View><Avatar size="lg" style={styles.settingsAvatar}>{session?.user.avatar ? <Avatar.Image source={{ uri: assetUrl(session.user.avatar) }} /> : <Avatar.Fallback>{session?.user.name.slice(0, 1) || "陈"}</Avatar.Fallback>}</Avatar></View>
        <SettingsRow label="昵称" value={session?.user.name || "—"} />
        <SettingsRow label="身份" value="社区球员" />
        <SettingsRow label="手机号" value={phone} />
        <SettingsRow label="登录方式" value="手机号快捷登录" last />
        <Pressable onPress={() => setConfirmLogout(true)} style={styles.logoutButton}><Text style={styles.logoutText}>退出登录</Text></Pressable>
      </ScrollView>
    </View>
  </PageFrame>;
}

function SettingsRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return <View style={[styles.settingsRow, !last && styles.rowDivider]}><Text style={styles.settingsRowLabel}>{label}</Text><Text style={styles.settingsRowValue}>{value}</Text></View>;
}
