import React, { useEffect } from "react";
import { Button, Tabs } from "heroui-native";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../theme/styles";
import type { MainTab } from "../types";

const navOptions: Array<{ key: MainTab; label: string; icon: string }> = [
  { key: "matches", label: "活动", icon: "/static/icons/calendar.svg" },
  { key: "leaderboard", label: "出勤榜", icon: "/static/icons/medal.svg" },
  { key: "members", label: "队员", icon: "/static/icons/persons.svg" },
  { key: "profile", label: "我的", icon: "/static/icons/person.svg" },
];

export function Backdrop({ dark = false }: { dark?: boolean }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={dark ? ["#071a2c", "#0b2a4a", "#0a1f3a"] : ["#0b1531", "#143b72", "#0a1c3d"]}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Image source={{ uri: "/static/backgrounds/glow-upper-right.svg" }} style={styles.glowTop} />
      <Image source={{ uri: "/static/backgrounds/glow-left.svg" }} style={styles.glowLeft} />
      <Image source={{ uri: "/static/backgrounds/glow-lower-right.svg" }} style={styles.glowBottom} />
    </View>
  );
}

function StatusLine() {
  return (
    <View style={styles.statusLine}>
      <Text style={styles.statusTime}>9:41</Text>
      <Text style={styles.statusSymbols}>●  ●  ▰</Text>
    </View>
  );
}

export function PageFrame({ children, dark = false, bottom, overlay }: { children: React.ReactNode; dark?: boolean; bottom?: React.ReactNode; overlay?: React.ReactNode }) {
  return (
    <View style={styles.frame}>
      <Backdrop dark={dark} />
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <StatusLine />
        {children}
        {bottom}
        {overlay}
      </SafeAreaView>
    </View>
  );
}

export function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);
  return (
    <View style={styles.toastWrap} pointerEvents="box-none">
      <View style={styles.toast}>
        <Text style={styles.toastCheck}>✓</Text>
        <Text style={styles.toastLabel} numberOfLines={1}>{message}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="关闭提示" onPress={onClose} style={styles.toastClose}><Text style={styles.toastCloseText}>×</Text></Pressable>
      </View>
    </View>
  );
}

export function PageHeader({ title, right, onBack }: { title: string; right?: React.ReactNode; onBack?: () => void }) {
  return (
    <View style={styles.header}>
      {onBack ? <Pressable accessibilityRole="button" onPress={onBack} style={styles.backHit}><Text style={styles.backText}>‹</Text></Pressable> : null}
      <Text style={styles.pageTitle}>{title}</Text>
      <View style={styles.headerSpacer} />
      {right || <View style={styles.capsule}><Text style={styles.capsuleText}>•••　⊙</Text></View>}
    </View>
  );
}

export function MainTabBar({ tab, onChange }: { tab: MainTab; onChange: (tab: MainTab) => void }) {
  return (
    <View style={styles.tabbarWrap}>
      <Tabs value={tab} onValueChange={(value) => onChange(value as MainTab)} variant="secondary" className="w-full" animation="disable-all">
        <Tabs.List style={styles.tabbar} className="rounded-2xl border border-white/15 bg-white/10">
          {navOptions.map((item) => (
            <Tabs.Trigger key={item.key} value={item.key} style={styles.tabTrigger}>
              <Image source={{ uri: item.icon }} style={[styles.tabIcon, tab !== item.key && styles.tabIconInactive]} />
              <Tabs.Label className={tab === item.key ? "text-[#73e5f7] text-[11px]" : "text-[#a9bfd7] text-[11px]"}>
                {item.label}
              </Tabs.Label>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs>
    </View>
  );
}

export function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={styles.formField}><Text style={styles.formLabel}>{label}</Text>{children}</View>;
}

export function LoadingState({ label }: { label: string }) {
  return <View style={styles.loading}><ActivityIndicator color="#73e5f7" /><Text style={styles.loadingText}>{label}</Text></View>;
}

export function MessageState({ message, action, onAction }: { message: string; action?: string; onAction?: () => void }) {
  return <View style={styles.messageState}><Text style={styles.messageText}>{message}</Text>{action && onAction ? <Button variant="secondary" size="sm" onPress={onAction}><Button.Label>{action}</Button.Label></Button> : null}</View>;
}
