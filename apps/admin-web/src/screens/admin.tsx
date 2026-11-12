import { useEffect, useState } from "react";
import { Avatar, Button, Card } from "heroui-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { api, assetUrl, clearSession, getSession, saveSession, type Match, type Member, type Session } from "../api";
import { MessageState, PageFrame, PageHeader } from "../components/shared";
import { MatchCard } from "./mini";
import { CreateMatchScreen } from "./create-match";
import { styles } from "../theme/styles";

export function AdminApp() {
  const [session, setSession] = useState<Session | null>(getSession());
  const [tab, setTab] = useState<"matches" | "members" | "charges">("matches");
  const [matches, setMatches] = useState<Match[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [charges, setCharges] = useState<Array<{ id: string; amount: number; date: string; note: string; memberName: string }>>([]);
  const [error, setError] = useState("");
  const [create, setCreate] = useState(false);
  const [busy, setBusy] = useState(false);
  const demoMode = process.env.EXPO_PUBLIC_DEMO_MODE !== "false" && process.env.NODE_ENV !== "production";

  const refresh = () => {
    setError("");
    const results = tab === "matches" ? api.matches("all") : tab === "members" ? api.members() : api.charges();
    results.then((value) => {
      if (tab === "matches") setMatches(value as Match[]);
      if (tab === "members") setMembers(value as Member[]);
      if (tab === "charges") setCharges(value as typeof charges);
    }).catch((reason: Error) => setError(reason.message));
  };
  useEffect(() => { if (session?.user.role === "admin") refresh(); }, [tab, session?.user.role]);

  async function signInAsAdmin() {
    setBusy(true);
    setError("");
    try {
      const result = await api.demoLogin("admin");
      saveSession(result);
      setSession(result);
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (create) return <CreateMatchScreen onBack={() => setCreate(false)} onCreated={() => { setCreate(false); refresh(); }} />;

  if (session?.user.role !== "admin") {
    return (
      <PageFrame>
        <View style={styles.screen}>
          <PageHeader title="管理后台" />
          <View style={styles.adminLoginWrap}>
            <Card style={styles.guestCard} className="rounded-3xl border border-white/20 bg-[#22395d] p-6">
              <Text style={styles.guestTitle}>管理员登录</Text>
              <Text style={styles.guestCopy}>请使用已授权的管理员账号</Text>
              <Button isDisabled={busy || !demoMode} variant="primary" onPress={() => { void signInAsAdmin(); }} className="mt-5 h-12 w-full rounded-xl bg-[#1d4ed8]">
                <Button.Label className="text-white">{busy ? "正在登录…" : "本地演示登录"}</Button.Label>
              </Button>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </Card>
          </View>
        </View>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <View style={styles.screen}>
        <PageHeader title={tab === "matches" ? "比赛管理" : tab === "members" ? "队员管理" : "充值记录"} right={tab === "matches" ? <Button size="sm" variant="primary" onPress={() => setCreate(true)}><Button.Label>＋ 新建比赛</Button.Label></Button> : <Pressable onPress={() => { clearSession(); setSession(null); }}><Text style={styles.adminNavText}>退出</Text></Pressable>} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {error ? <MessageState message={error} action="重新加载" onAction={refresh} /> : null}
          {tab === "matches" && matches.map((match) => <MatchCard key={match.id} match={match} onPress={() => undefined} />)}
          {tab === "members" && <Card style={styles.rankingCard} className="rounded-3xl border border-white/20 bg-[#22395d] px-4 py-2">{members.map((member, index) => <View key={member.id} style={[styles.memberRow, index < members.length - 1 && styles.rowDivider]}><Avatar size="md" style={styles.avatarMedium}>{member.avatar ? <Avatar.Image source={{ uri: assetUrl(member.avatar) }} /> : <Avatar.Fallback>{member.name.slice(0, 1)}</Avatar.Fallback>}</Avatar><View style={styles.memberRowCopy}><Text style={styles.memberName}>{member.name}</Text><Text style={styles.memberSub}>{member.position} · #{member.number}</Text></View><Text style={styles.attendanceCount}>{member.attendance || 0} 场</Text></View>)}</Card>}
          {tab === "charges" && <Card style={styles.rankingCard} className="rounded-3xl border border-white/20 bg-[#22395d] px-4 py-2">{charges.map((charge, index) => <View key={charge.id} style={[styles.memberRow, index < charges.length - 1 && styles.rowDivider]}><View style={styles.memberRowCopy}><Text style={styles.memberName}>{charge.memberName}</Text><Text style={styles.memberSub}>{charge.date} · {charge.note || "充值"}</Text></View><Text style={styles.attendanceCount}>¥{Number(charge.amount).toFixed(2)}</Text></View>)}</Card>}
          {!error && ((tab === "matches" && !matches.length) || (tab === "members" && !members.length) || (tab === "charges" && !charges.length)) ? <MessageState message="暂无数据" /> : null}
        </ScrollView>
        <View style={styles.adminNav}>
          {[{ key: "matches", label: "比赛" }, { key: "members", label: "队员" }, { key: "charges", label: "充值" }].map((item) => <Pressable key={item.key} onPress={() => setTab(item.key as typeof tab)} style={[styles.adminNavItem, tab === item.key && styles.adminNavItemActive]}><Text style={tab === item.key ? styles.adminNavTextActive : styles.adminNavText}>{item.label}</Text></Pressable>)}
        </View>
      </View>
    </PageFrame>
  );
}
